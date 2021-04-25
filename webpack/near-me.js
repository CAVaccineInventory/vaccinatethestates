import mapboxgl from "mapbox-gl";

import mapMarker from "./templates/mapMarker.handlebars";
import { initSearch } from "./search.js";
import {
  toggleVisibility,
  isSelected,
  select,
  deselect,
  toggleSelect,
} from "./utils/dom.js";
import { mapboxToken } from "./utils/constants.js";
import { isSmallScreen } from "./utils/misc.js";
import { siteCard } from "./site.js";

window.addEventListener("load", () => load());

let zipErrorElem;
const featureLayer = "vial";

// State tracking for selected site card
let selectedSiteId = false;

// State tracking for selected marker popup
let selectedMarkerPopup = false;

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

    displayPopup(props, coordinates);

    document.dispatchEvent(new CustomEvent("markerSelected", {
      detail: { siteId: props.id },
    }));
  });
  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on("mouseenter", featureLayer, function () {
    map.getCanvas().style.cursor = "pointer";
  });
  // Change it back to a pointer when it leaves.
  map.on("mouseleave", featureLayer, function () {
    map.getCanvas().style.cursor = "";
  });

  const sourceId = "vialSource";
  map.on("load", () => {
    map.addSource(sourceId, {
      type: "vector",
      url: "mapbox://calltheshots.vaccinatethestates",
    });

    map.addLayer({
      "id": featureLayer,
      "type": "circle",
      "source": sourceId,
      "source-layer": "vialHigh",
      "paint": {
        "circle-radius": 4,
        "circle-color": "#059669",
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
      },
    });

    map.addLayer({
      "id": "vialLow",
      "type": "circle",
      "source": sourceId,
      "source-layer": "vialLow",
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
    if (map.getSource(sourceId) && map.isSourceLoaded(sourceId)) {
      mapInitializedResolver();
      renderCardsFromMap();

      // We only need this on the initial load, so now we're done!
      map.off("sourcedata");
    }
  });

  // Reload cards on map movement
  map.on("moveend", () => {
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
    cards.appendChild(siteCard(feature.properties));
  });

  if (selectedSiteId && !isSmallScreen()) {
    selectSite(selectedSiteId);
  }

  document.querySelectorAll(".site-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (isSmallScreen()) {
        return;
      }

      toggleSelect(card);
      if (isSelected(card)) {
        if (selectedSiteId && selectedSiteId != card.id) {
          deselect(document.getElementById(selectedSiteId));
        }
        selectedSiteId = card.id;
        document.dispatchEvent(
          new CustomEvent("siteCardSelected", {
            detail: { siteId: card.id },
          })
        );
      } else {
        selectedSiteId = false;
        document.dispatchEvent(
          new CustomEvent("siteCardDeselected", {
            detail: { siteId: card.id },
          })
        );
      }
    });
  });
};

document.addEventListener("siteCardSelected", (ev) => {
  const siteId = ev.detail.siteId;
  const features = getUniqueFeatures(
    map.queryRenderedFeatures({ layers: [featureLayer] })
  );
  const matches = features.filter(
    (x) => x.properties && x.properties.id === siteId
  );
  const feature = matches && matches.length > 0 && matches[0];

  if (!feature) {
    return;
  }

  const coordinates = feature.geometry.coordinates.slice();
  const props = feature.properties;

  displayPopup(props, coordinates);
});

document.addEventListener("siteCardDeselected", (ev) => {
  if (isSmallScreen()) return;

  selectedMarkerPopup && selectedMarkerPopup.remove();
  selectedMarkerPopup = false;
});

document.addEventListener("markerSelected", (ev) => {
  if (isSmallScreen()) return;
  selectSite(ev.detail.siteId);
});

document.addEventListener("markerDeselected", (ev) => {
  if (isSmallScreen()) return;

  deselect(document.getElementById(ev.detail.id));
  if (selectedSiteId) {
    deselect(document.getElementById(selectedSiteId));
    selectedSiteId = false;
  }
});

const selectSite = (siteId) => {
  const site = document.getElementById(siteId);
  select(site);
  site && site.scrollIntoView({ behavior: "smooth" });

  if (selectedSiteId && selectedSiteId != siteId) {
    deselect(document.getElementById(selectedSiteId));
  }
  selectedSiteId = siteId;
};

const displayPopup = (props, coordinates) => {
  if (selectedMarkerPopup) {
    selectedMarkerPopup.remove();
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
  const popup = new mapboxgl.Popup({
    maxWidth: "50%",
    focusAfterOpen: false,
  })
    .setLngLat(coordinates)
    .setHTML(marker)
    .addTo(map);

  popup.on("close", () => {
    document.dispatchEvent(new CustomEvent("markerDeselected", {
      detail: { siteId: props.id },
    }));
  });

  if (selectedMarkerPopup != popup) {
    selectedMarkerPopup = popup;
  }
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

async function moveMap(lat, lng, zoom) {
  await mapInitialized;
  map.flyTo({ center: [lng, lat], zoom: zoom });
}

const load = () => {
  zipErrorElem = document.getElementById("js-unknown-zip-code-alert");
  initMap();
  initSearch(
    {
      locCallback: (lat, lng, zoom, source) => {
        if (source === "search") {
          history.pushState({}, "", `?lat=${lat}&lng=${lng}&zoom=${zoom}`);
        }
        toggleVisibility(zipErrorElem, false);
        moveMap(lat, lng, zoom);
      },
    },
    true
  );
};
