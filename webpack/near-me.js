import mapboxgl from "mapbox-gl";
import siteCard from "./templates/siteCard.handlebars";
import { initSearch } from "./search.js";
import { t } from "./i18n.js";
import * as Sentry from "@sentry/browser";

window.addEventListener("load", () => load());

const featureLayer = "jesse";
const mapboxToken =
  "pk.eyJ1IjoiY2FsbHRoZXNob3RzIiwiYSI6ImNrbjZoMmlsNjBlMDQydXA2MXNmZWQwOGoifQ.rirOl_C4pftVf9LgxW5EGw";

let mapInitializedResolver;
const mapInitialized = new Promise(
  (resolve) => (mapInitializedResolver = resolve)
);

const initMap = (zip) => {
  mapboxgl.accessToken = mapboxToken;
  window.map = new mapboxgl.Map({
    container: "map",
    style:
      "mapbox://styles/calltheshots/ckn6plmc90jme17pqc65d55ld?optimize=true",
    center: [-98, 40], // starting position [lng, lat]
    zoom: 3, // starting zoom
  });

  map.on("click", featureLayer, function (e) {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = JSON.stringify(e.features[0].properties);

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup().setLngLat(coordinates).setHTML(description).addTo(map);
  });
  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on("mouseenter", featureLayer, function () {
    map.getCanvas().style.cursor = "pointer";
  });
  // Change it back to a pointer when it leaves.
  map.on("mouseleave", featureLayer, function () {
    map.getCanvas().style.cursor = "";
  });

  map.on("load", featureLayer, () => {
    mapInitializedResolver();
    renderCardsFromMap();
  });

  // Reload cards on map movement
  map.on("moveend", featureLayer, renderCardsFromMap);
};

const renderCardsFromMap = () => {
  if (!window.map) {
    initMap();
  }

  const features = getUniqueFeatures(map.queryRenderedFeatures()).slice(0, 10);
  const cards = document.getElementById("cards");
  cards.innerHTML = "";

  features.forEach((feature) => {
    const templateInfo = {
      body: feature.id,
    };
    const range = document
      .createRange()
      .createContextualFragment(siteCard(templateInfo));

    cards.appendChild(range);
  });
};

const getUniqueFeatures = (array) => {
  const existingFeatureKeys = {};
  // Because features come from tiled vector data, feature geometries may be split
  // or duplicated across tile boundaries and, as a result, features may appear
  // multiple times in query results.
  const uniqueFeatures = array.filter(function (el) {
    if (existingFeatureKeys[el.id]) {
      return false;
    } else {
      existingFeatureKeys[el.id] = true;
      return true;
    }
  });

  return uniqueFeatures;
};

async function geocodeAndZoom(zip) {
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
    Sentry.captureException(new Error("Could not geocode ZIP"));
    return;
  }

  const center = json["features"][0]["center"];
  moveMap(center[1], center[0]);
}

function moveMap(lat, lon) {
  map.flyTo({ center: [lon, lat], zoom: 9 });
}

const load = () => {
  initSearch({
    type: "display",
    zipCallback: (zip) => {
      geocodeAndZoom(zip);
    },
    geoCallback: (lat, lon) => {
      moveMap(lat, lon);
    },
    geoErrorCallback: () => {
      Sentry.captureException(new Error("Could not geolocate user"));
      alert(t("alert_detect"));
    },
  });
  initMap();
};
