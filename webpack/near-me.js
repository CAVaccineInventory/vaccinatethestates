import mapboxgl from "mapbox-gl";

import mapMarker from "./templates/mapMarker.handlebars";
import { toggleVisibility, isSelected, select, deselect } from "./utils/dom.js";
import { mapboxToken } from "./utils/constants.js";
import { isSmallScreen } from "./utils/misc.js";
import { replaceState } from "./utils/history.js";
import { createVaccineFilter } from "./utils/mapbox.js";
import { siteCard } from "./site.js";

const featureLayer = "vial";
const vialSourceId = "vialSource";

// State tracking for map & list user interactions
let selectedSiteId = null;
let selectedFeatureId = null;
let selectedMarkerPopup = null;
let scrollToCard = false;

let renderCardsTimeoutId = null;
let preventNextHistoryChange = false;

let mapInitializedResolver;
const mapInitialized = new Promise(
  (resolve) => (mapInitializedResolver = resolve)
);

export const initMap = () => {
  mapboxgl.accessToken = mapboxToken;
  window.map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/calltheshots/cko9bo2ex5x6x17unjidv9a7j",
    center: [-98, 40], // starting position [lng, lat]
    zoom: 3, // starting zoom
  });

  // Feature-layer specific click event
  map.on("click", featureLayer, function (e) {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const props = e.features[0].properties;

    // Set states before zooming so that when zooming
    // finishes, handler will read the correct states
    // (select the correct card, scroll vs no scroll, etc.)
    handleMarkerSelected(props.id, coordinates);
  });

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on("mouseenter", featureLayer, () => {
    map.getCanvas().style.cursor = "pointer";
  });
  // Change it back to a pointer when it leaves.
  map.on("mouseleave", featureLayer, () => {
    map.getCanvas().style.cursor = "";
  });

  map.on("load", () => {
    map.addSource(vialSourceId, {
      type: "vector",
      url: "mapbox://calltheshots.vaccinatethestates",
    });

    const filter = createVaccineFilter();
    const highLayer = {
      "id": featureLayer,
      "type": "circle",
      "source": vialSourceId,
      "source-layer": "vialHigh",
      "paint": {
        "circle-radius": [
          "case",
          ["boolean", ["feature-state", "active"], false],
          6,
          4,
        ],
        "circle-color": "#059669",
        "circle-stroke-width": [
          "case",
          ["boolean", ["feature-state", "active"], false],
          2,
          1,
        ],
        "circle-stroke-color": "#fff",
      },
    };
    if (filter) {
      highLayer.filter = filter;
    }
    map.addLayer(highLayer);

    map.addLayer({
      "id": "vialLow",
      "type": "circle",
      "source": vialSourceId,
      "source-layer": "vialLow",
      "paint": {
        "circle-radius": 3,
        "circle-color": "#059669",
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
      },
    });
  });

  map.on("sourcedata", onSourceData);

  // Reload cards on map movement
  map.on("moveend", async () => {
    await mapInitialized;

    // When a marker is selected, it is centered in the map,
    // which raises the `moveend` event and we want to scroll
    // to the card...
    renderCardsFromMap();
    // But subsequent map movements (other than marker selection)
    // shouldn't scroll anything.
    scrollToCard = false;

    if (!preventNextHistoryChange) {
      const { lat, lng } = map.getCenter();
      replaceState({
        lat,
        lng,
        zoom: map.getZoom(),
      });
    }
    preventNextHistoryChange = false;
  });

  initFilters();
};

const initFilters = () => {
  const dropdown = document.querySelector(".js-filter-dropdown");

  window.addEventListener('click', () => {
    // any outside click closes the dropdown
    toggleVisibility(dropdown, false);
  })

  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  })

  document.querySelector(".js-filter-button").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleVisibility(dropdown, dropdown.classList.contains("hidden"));
  })
}

const onSourceData = (e) => {
  if (e.sourceId === vialSourceId && e.isSourceLoaded) {
    // We want to make sure the vial data is fully loaded before we try to
    // render the cards and resolve the map initialization
    mapInitializedResolver();

    // We only need this on the initial load, so now we're done!
    map.off("sourcedata", onSourceData);
  }
};

const toggleCardVisibility = () => {
  const cardsContainer = document.getElementById("cards_container");
  const zoomedOutContainer = document.getElementById("zoomed_out_view");
  if (map.getZoom() <= 6) {
    toggleVisibility(cardsContainer, false);
    toggleVisibility(zoomedOutContainer, true);
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

  if (!map.isSourceLoaded(vialSourceId)) {
    // For reasons unknown, we will hit this function when the source is not loaded, even though we await the source data loading
    // prior to calling it. Manual testing tells us that the loaded flag gets toggled to false on movement,
    // and unfortunately there is no known callback to hook into to safely get this. To workaround this problem,
    // we simply try again, and again, if the map is not loaded.
    if (renderCardsTimeoutId) {
      clearTimeout(renderCardsTimeoutId);
    }
    renderCardsTimeoutId = setTimeout(renderCardsFromMap, 100);
    return;
  }

  toggleCardVisibility();

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
    cards.appendChild(
      siteCard(feature.properties, feature.geometry.coordinates)
    );
  });

  if (selectedSiteId) {
    triggerSelectSite(selectedSiteId, features);
  }

  document.querySelectorAll(".site-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (isSelected(card)) {
        triggerUnselectSite();
      } else {
        triggerUnselectSite();
        triggerSelectSite(card.id, features);
      }
    });
  });
};

const triggerSelectSite = (siteId, features) => {
  const matches = features.filter(
    (x) => x.properties && x.properties.id === siteId
  );
  const feature = matches && matches.length > 0 && matches[0];

  if (!feature) {
    return;
  }

  const site = document.getElementById(siteId);
  select(site);

  // Scroll the site into viewport
  if (site && scrollToCard) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  map.setFeatureState(
    { source: vialSourceId, sourceLayer: "vialHigh", id: feature.id },
    { active: true }
  );

  const coordinates = feature.geometry.coordinates.slice();
  const props = feature.properties;
  displayPopup(props, coordinates);

  selectedFeatureId = feature.id;
  selectedSiteId = siteId;
};

const triggerUnselectSite = () => {
  if (selectedSiteId) {
    deselect(document.getElementById(selectedSiteId));
  }
  if (selectedFeatureId) {
    map.setFeatureState(
      { source: vialSourceId, sourceLayer: "vialHigh", id: selectedFeatureId },
      { active: false }
    );
  }

  selectedFeatureId = null;
  selectedMarkerPopup && selectedMarkerPopup.remove();
  selectedMarkerPopup = null;
  selectedSiteId = null;
};

const handleMarkerSelected = (siteId, coordinates) => {
  triggerUnselectSite(siteId);
  selectedSiteId = siteId;
  scrollToCard = !isSmallScreen();
  map.flyTo({
    center: coordinates,
  });
};

const handlePopupClosed = (id) => {
  if (id === selectedSiteId) {
    selectedMarkerPopup = null;
    triggerUnselectSite();
  } // else, popup was closed because another marker was clicked, which handles unselecting / reselecting
};

const displayPopup = (props, coordinates) => {
  if (selectedMarkerPopup && selectedSiteId === props.id) {
    return; // already showing
  }

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
    offset: 4,
  })
    .setLngLat(coordinates)
    .setHTML(marker)
    .addTo(map);

  popup.on("close", () => handlePopupClosed(props.id));

  selectedMarkerPopup = popup;
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

export async function moveMap(lat, lng, zoom, animate, siteId) {
  await mapInitialized;
  if (siteId) {
    preventNextHistoryChange = true;
    selectedSiteId = siteId;
  }
  if (animate) {
    map.flyTo({ center: [lng, lat], zoom: zoom });
  } else {
    map.jumpTo({ center: [lng, lat], zoom: zoom });
  }
}
