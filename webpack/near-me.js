import mapboxgl from "mapbox-gl";
import siteCard from './templates/siteCard.handlebars';

window.addEventListener("load", () => load());

const featureLayer = "jesse";

const initMap = () => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiY2FsbHRoZXNob3RzIiwiYSI6ImNrbjZoMmlsNjBlMDQydXA2MXNmZWQwOGoifQ.rirOl_C4pftVf9LgxW5EGw";
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

  // Initial card load
  map.on("load", featureLayer, renderCardsFromMap);

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
    const range = document.createRange().createContextualFragment(siteCard(templateInfo));

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
}

const load = () => {
  initMap();
};
