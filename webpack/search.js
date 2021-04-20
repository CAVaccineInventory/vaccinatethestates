import { t } from "./i18n.js";
import { toggleVisibility } from "./utils/dom.js";
import { mapboxToken } from "./near-me.js";

let usingLocation = false;

/**
 * Initializes the search JS.
 * @param {Object} opts: in pseudo typescript:
 * initSearch: (opts: Options) => void;
 *
 * interface Options {
 *   geocoderCallback: (result: GeocoderResult) => void,
 *   zipCallback: (zip: number, zoom?: number) => void,
 *   locCallback: (lat: number, lng: number, zoom?: number) => void
 *   geoErrorCallback: (error) => void
 * }
 */

export const initSearch = (opts) => {
  if (opts.type === "display") {
    handleUrlParamsOnLoad(opts);
  }

  // TODO: import MapboxGeocoder via npm module instead of adding it as a script tag in head
  // blocked on https://github.com/mapbox/mapbox-gl-geocoder/issues/414
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxToken,
    types: "country,region,place,postcode,locality,neighborhood,address",
    countries: "us",
  });
  geocoder.addTo("#geocoder");
  geocoder.on("result", (result) => {
    opts.geocoderCallback(result);
  });

  const geolocationSubmit = document.getElementById("js-submit-geolocation");
  const geolocationSubmitText = document.getElementById("js-geolocation-text");
  const geocoderInput = document.querySelector(".mapboxgl-ctrl-geocoder--input");

  // setting up listeners
  geocoderInput.addEventListener("focus", () => {
    if (!usingLocation && !geocoderInput.value) {
      geolocationSubmitText.textContent = t("my_location");
      toggleVisibility(geolocationSubmit, true);
    }
  });

  geocoderInput.addEventListener("blur", () => {
    setTimeout(() => {
      if (!usingLocation) {
        toggleVisibility(geolocationSubmit, false);
      }
    }, 200);
  });

  geocoderInput.addEventListener("input", () => {
    if (!usingLocation) {
      toggleVisibility(geolocationSubmit, false);
    }
  })

  geolocationSubmit.addEventListener("click", (e) => {
    e.preventDefault();
    usingLocation = true;
    geolocationSubmitText.textContent = t("getting_location");
    handleGeoSearch(opts);
  });

  handleUrlParamsOnLoad(opts);
};

const handleGeoSearch = (opts) => {
  const geolocationSubmit = document.getElementById("js-submit-geolocation");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      usingLocation = false;
      toggleVisibility(geolocationSubmit, false);
      opts.locCallback(position.coords.latitude, position.coords.longitude);
    },
    (err) => {
      usingLocation = false;
      toggleVisibility(geolocationSubmit, false);
      console.warn(err);
      opts.geoErrorCallback(err);
    },
    {
      maximumAge: 1000 * 60 * 5, // 5 minutes
      timeout: 1000 * 15, // 15 seconds
    }
  );
};

function handleUrlParamsOnLoad(opts) {
  const urlParams = new URLSearchParams(window.location.search);
  const zip = urlParams.get("zip");
  const lat = urlParams.get("lat");
  const lng = urlParams.get("lng");
  const zoom = urlParams.get("zoom");

  if (zip) {
    const zipInput = document.getElementById("js-zip-input");
    if (zipInput) {
      zipInput.value = zip;
    }
    opts.zipCallback(zip, zoom);
  } else if (lat && lng) {
    opts.locCallback(lat, lng, zoom);
  } else if (urlParams.get("locate")) {
    handleGeoSearch(opts);
  }
}