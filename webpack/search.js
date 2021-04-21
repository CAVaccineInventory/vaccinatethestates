import * as Sentry from "@sentry/browser";

import { t } from "./i18n.js";
import { toggleVisibility } from "./utils/dom.js";
import { mapboxToken } from "./utils/constants.js";

let usingLocation = false;
let callbacks = null;

/**
 * Initializes the search JS.
 * @param {Object} callbacks: in pseudo typescript:
 * initSearch: (callbacks: Callbacks, parseQueryParams) => void;
 *
 * interface Callbacks {
 *   locCallback: (lat: number, lng: number, zoom: number, source: Source) => void
 *   geoErrorCallback: (error) => void
 * }
 *
 * type Source = "params" | "search" | "locate"
 */

export const initSearch = (cb, parseQueryParams) => {
  callbacks = cb; // TODO: lots of assumptions here!!

  // TODO: import MapboxGeocoder via npm module instead of adding it as a script tag in head
  // blocked on https://github.com/mapbox/mapbox-gl-geocoder/issues/414
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxToken,
    types: "region,place,postcode,locality,neighborhood,address",
    countries: "us",
    placeholder: t("search_hint"),
    language: document.documentElement.getAttribute("lang") || "en",
  });
  geocoder.addTo("#geocoder");
  geocoder.on("result", ({ result }) => {
    if (result && result.center) {
      console.log(result);
      // TODO: different zooms based on type of place
      const [lng, lat] = result.center;
      submitLocation(lat, lng, 12, "search");
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

  if (parseQueryParams) {
    handleUrlParamsOnLoad();
    window.addEventListener("popstate", () => {
      handleUrlParamsOnLoad();
    });
  }
};

const handleGeoSearch = () => {
  const geolocationSubmit = document.getElementById("js-submit-geolocation");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      usingLocation = false;
      toggleVisibility(geolocationSubmit, false);
      submitLocation(
        position.coords.latitude,
        position.coords.longitude,
        12,
        "locate"
      );
    },
    (err) => {
      usingLocation = false;
      toggleVisibility(geolocationSubmit, false);
      console.warn(err);
      if (callbacks) {
        Sentry.captureException(new Error("Could not geolocate user"));
        alert(t("alert_detect"));
      }
    },
    {
      maximumAge: 1000 * 60 * 5, // 5 minutes
      timeout: 1000 * 15, // 15 seconds
    }
  );
};

async function geocodeZip(zip, zoom) {
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
  submitLocation(center[1], center[0], zoom || 12, "params");
}

const submitLocation = (lat, lng, zoom, source) => {
  if (callbacks) {
    callbacks.locCallback(lat, lng, zoom, source);
  }
};

const handleUrlParamsOnLoad = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const zip = urlParams.get("zip");
  const lat = urlParams.get("lat");
  const lng = urlParams.get("lng");
  const zoom = urlParams.get("zoom");

  if (zip) {
    geocodeZip(zip, zoom);
  } else if (lat && lng) {
    submitLocation(lat, lng, zoom || 12, "params");
  } else if (urlParams.get("locate")) {
    handleGeoSearch();
  }
};
