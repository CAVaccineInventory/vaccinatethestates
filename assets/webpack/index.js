import siteCard from "./templates/siteCard.handlebars";

window.addEventListener("load", () => load());

const initMap = () => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiY2FsbHRoZXNob3RzIiwiYSI6ImNrbjZoMmlsNjBlMDQydXA2MXNmZWQwOGoifQ.rirOl_C4pftVf9LgxW5EGw';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/calltheshots/ckn6plmc90jme17pqc65d55ld?optimize=true',
    center: [-98, 40], // starting position [lng, lat]
    zoom: 3 // starting zoom
  });

  map.on('click', 'jesse', function(e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = JSON.stringify(e.features[0].properties);

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
  });
  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', 'jesse', function () {
    map.getCanvas().style.cursor = 'pointer';
  });
  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'jesse', function () {
    map.getCanvas().style.cursor = '';
  });
};

const initCards = () => {
    const range = document
    .createRange()
    .createContextualFragment(siteCard({}));

    document.getElementById("cards").appendChild(range)
};

const load = () => { 
    initMap();
    initCards();
}