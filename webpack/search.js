import * as Sentry from "@sentry/browser";

import { t } from "./i18n.js";
import { toggleVisibility } from "./utils/dom.js";
import { mapboxToken } from "./near-me.js";

let usingLocation = false;
let callbacks = [];

/**
 * Initializes the search JS.
 * @param {Object} callbacks: in pseudo typescript:
 * initSearch: (callbacks: Callbacks) => void;
 *
 * interface Callbacks {
 *   locCallback: (lat: number, lng: number, zoom: number) => void
 *   geoErrorCallback: (error) => void
 * }
 */

export const initSearch = (cb) => {
  callbacks.push(cb);

  // TODO: import MapboxGeocoder via npm module instead of adding it as a script tag in head
  // blocked on https://github.com/mapbox/mapbox-gl-geocoder/issues/414
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxToken,
    types: "region,place,postcode,locality,neighborhood,address",
    countries: "us",
  });
  geocoder.addTo("#geocoder");
  geocoder.on("result", ({ result } ) => {
    if (result && result.center) {
      console.log(result);
      // TODO: different zooms based on type of place
      const [lng, lat] = result.center;
      submitLocation(lat, lng, 12, true);
    }
  });

  const geolocationSubmit = document.getElementById("js-submit-geolocation");
  const geolocationSubmitText = document.getElementById("js-geolocation-text");
  const geocoderInput = document.querySelector(
    ".mapboxgl-ctrl-geocoder--input"
  );

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
  });

  geolocationSubmit.addEventListener("click", (e) => {
    e.preventDefault();
    usingLocation = true;
    geolocationSubmitText.textContent = t("getting_location");
    handleGeoSearch();
  });

  handleUrlParamsOnLoad();
  window.addEventListener("popstate", () => {
    handleUrlParamsOnLoad();
  });
};

const handleGeoSearch = () => {
  const geolocationSubmit = document.getElementById("js-submit-geolocation");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      usingLocation = false;
      toggleVisibility(geolocationSubmit, false);
      submitLocation(position.coords.latitude, position.coords.longitude, 12, false);
    },
    (err) => {
      usingLocation = false;
      toggleVisibility(geolocationSubmit, false);
      console.warn(err);
      callbacks.forEach(cb => {
        cb.geoErrorCallback(err);
      })
    },
    {
      maximumAge: 1000 * 60 * 5, // 5 minutes
      timeout: 1000 * 15, // 15 seconds
    }
  );
};

async function geocodeZip(zip) {
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
  submitLocation(center[1], center[0], 12, false);
}

const submitLocation = (lat, lng, zoom, pushState) => {
  if (pushState) {
    history.pushState({}, "", `?lat=${lat}&lng=${lng}&zoom=${zoom}`)
  }
  callbacks.forEach(cb => cb.locCallback(lat, lng, zoom));
}

const handleUrlParamsOnLoad = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const zip = urlParams.get("zip");
  const lat = urlParams.get("lat");
  const lng = urlParams.get("lng");
  const zoom = urlParams.get("zoom");

  if (zip) {
    geocodeZip(zip);
  } else if (lat && lng) {
    callbacks.forEach(cb => cb.locCallback(lat, lng, zoom));
  } else if (urlParams.get("locate")) {
    handleGeoSearch();
  }
}