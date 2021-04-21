import mapboxgl from "mapbox-gl";
import * as Sentry from "@sentry/browser";

import siteCard from "./templates/siteCard.handlebars";
import mapMarker from "./templates/mapMarker.handlebars";
import { initSearch } from "./search.js";
import { t } from "./i18n.js";
import { toggleVisibility } from "./utils/dom.js";
import { markdownify } from "./utils/markdown.js";

window.addEventListener("load", () => load());

let zipErrorElem;
const featureLayer = "vial";
export const mapboxToken =
  "pk.eyJ1IjoiY2FsbHRoZXNob3RzIiwiYSI6ImNrbjZoMmlsNjBlMDQydXA2MXNmZWQwOGoifQ.rirOl_C4pftVf9LgxW5EGw";

let mapInitializedResolver;
const mapInitialized = new Promise(
  (resolve) => (mapInitializedResolver = resolve)
);

const initMap = () => {
  mapboxgl.accessToken = mapboxToken;
  window.map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-98, 40], // starting position [lng, lat]
    zoom: 3, // starting zoom
  });

  map.on("click", featureLayer, function (e) {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const props = e.features[0].properties;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    const addressLink = props.address
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        props.address
      )}`
      : null;

    const marker = mapMarker({
      name: props.name,
      address: props.address,
      website: props.website,
      addressLink,
    });
    new mapboxgl.Popup({ maxWidth: "50%" })
      .setLngLat(coordinates)
      .setHTML(marker)
      .addTo(map);
  });
  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on("mouseenter", featureLayer, function () {
    map.getCanvas().style.cursor = "pointer";
  });
  // Change it back to a pointer when it leaves.
  map.on("mouseleave", featureLayer, function () {
    map.getCanvas().style.cursor = "";
  });

  map.on("load", () => {
    map.addSource(featureLayer, {
      type: "vector",
      url: "mapbox://calltheshots.vaccinatethestates",
    });

    map.addLayer({
      "id": featureLayer,
      "type": "circle",
      "source": "vial",
      "source-layer": "vial",
      "paint": {
        "circle-radius": 4,
        "circle-color": "#059669",
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
      },
    });
  });

  // We want to make sure the vial data is fully loaded before we try to render
  // cards and resolve the map initialization
  map.on("sourcedata", () => {
    if (map.getSource(featureLayer) && map.isSourceLoaded(featureLayer)) {
      mapInitializedResolver();
      renderCardsFromMap();

      // We only need this on the initial load, so now we're done!
      map.off("sourcedata");
    }
  });

  // Reload cards on map movement
  map.on("moveend", featureLayer, () => {
    toggleCardVisibility();
    renderCardsFromMap();
  });
};

const toggleCardVisibility = () => {
  const cardsContainer = document.getElementById("cards_container");
  const zoomedOutContainer = document.getElementById("zoomed_out_view");
  if (map.getZoom() < 6) {
    toggleVisibility(cardsContainer, false);
    toggleVisibility(zoomedOutContainer, true);
    return;
  } else {
    toggleVisibility(cardsContainer, true);
    toggleVisibility(zoomedOutContainer, false);
  }
};

const renderCardsFromMap = () => {
  if (!window.map) {
    initMap();
  }

  const noSites = document.getElementById("js-no-sites-alert");

  const features = getUniqueFeatures(
    map.queryRenderedFeatures({ layers: [featureLayer] })
  ).map((feature) => {
    const ll = new mapboxgl.LngLat(...feature.geometry.coordinates);
    feature["distance"] = ll.distanceTo(map.getCenter());
    return feature;
  });

  toggleVisibility(noSites, !features.length);

  features.sort((a, b) => a.distance - b.distance);

  const cards = document.getElementById("cards");
  cards.innerHTML = "";

  features.slice(0, 50).forEach((feature) => {
    const site = new Site(feature.properties);

    const range = document
      .createRange()
      .createContextualFragment(siteCard(site.context()));

    cards.appendChild(range);
  });
};

const getUniqueFeatures = (array) => {
  const existingFeatureKeys = {};
  // Because features come from tiled vector data, feature geometries may be split
  // or duplicated across tile boundaries and, as a result, features may appear
  // multiple times in query results.
  const uniqueFeatures = array.filter(function (el) {
    if (existingFeatureKeys[el.properties["id"]]) {
      return false;
    } else {
      existingFeatureKeys[el.properties["id"]] = true;
      return true;
    }
  });

  return uniqueFeatures;
};

async function geocodeAndZoom(zip, zoom) {
  await mapInitialized;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${zip}.json?country=us&limit=1&types=postcode&access_token=${mapboxToken}`;
  const response = await fetch(url);

  Sentry.setContext("input", {
    zip: zip,
  });

  if (!response.ok) {
    Sentry.captureException(new Error("Could not geocode ZIP"));
    return;
  }

  const json = await response.json();

  if (json["features"].length < 1 || !json["features"][0]["center"]) {
    toggleVisibility(zipErrorElem, true);
    Sentry.captureException(new Error("Could not geocode ZIP"));
    return;
  }

  const center = json["features"][0]["center"];
  moveMap(center[1], center[0], zoom);
}

async function moveMap(lat, lng, zoom) {
  await mapInitialized;
  map.flyTo({ center: [lng, lat], zoom: zoom || 13 });
}

async function moveMapForGeocoder(geocoderResponse) {
  await mapInitialized;
  map.flyTo({ ...geocoderResponse.result, zoom: 13 });
}

const load = () => {
  zipErrorElem = document.getElementById("js-unknown-zip-code-alert");
  initMap();
  initSearch({
    zipCallback: (zip, zoom) => {
      toggleVisibility(zipErrorElem, false);
      geocodeAndZoom(zip, zoom);
    },
    locCallback: (lat, lng, zoom) => {
      moveMap(lat, lng, zoom);
    },
    geocoderCallback: (response) => {
      moveMapForGeocoder(response);
    },
    geoErrorCallback: () => {
      Sentry.captureException(new Error("Could not geolocate user"));
      alert(t("alert_detect"));
    },
  });
};

class Site {
  constructor(properties) {
    this.properties = properties;
  }
  googleMapsLink() {
    if (this.properties["address"]) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        this.properties["address"]
      )}`;
    } else {
      return null;
    }
  }
  hasMoreInfo() {
    return this.properties["phone_number"] || this.properties["website"];
  }
  appointmentDetails() {
    return this.properties["appointment_details"]
      ? markdownify(this.properties["appointment_details"])
      : null;
  }
  notes() {
    return this.properties["public_notes"]
      ? markdownify(this.properties["public_notes"])
      : null;
  }
  context() {
    return {
      id: this.properties["id"],
      name: this.properties["name"],
      address: this.properties["address"],
      addressLink: this.googleMapsLink(),
      hours: this.properties["hours"],
      moreInfo: this.hasMoreInfo(),
      website: this.properties["website"],
      phoneNumber: this.properties["phone_number"],
      appointmentDetails: this.appointmentDetails(),
      notes: this.notes(),
      vaccinefinder: this.properties.hasOwnProperty(
        "vaccinefinder_location_id"
      ),
      vaccinespotter: this.properties.hasOwnProperty(
        "vaccinespotter_location_id"
      ),
      google: this.properties.hasOwnProperty("google_place_id"),
    };
  }
}
