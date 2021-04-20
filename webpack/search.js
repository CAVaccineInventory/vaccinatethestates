import { t } from "./i18n.js";
import { toggleVisibility } from "./utils/dom.js";

/**
 * Initializes the search JS.
 * @param {Object} opts: in pseudo typescript:
 * initSearch: (opts: Options) => void;
 * 
 * // For displaying content on near-me
 * interface Options {
 *   zipCallback: (zip: number, zoom?: number) => void,
 *   geoCallback: (lat: number, lng: number, zoom?: number) => void
 *   geoErrorCallback: (error) => void
 * }
 */
export const initSearch = (opts) => {
  const form = document.getElementById("js-submit-zip-form");
  const zipInput = document.getElementById("js-zip-input");
  const geolocationSubmit = document.getElementById("js-submit-geolocation");
  const myLocation = document.getElementById("js-my-location");

  if (!zipInput) {
    return;
  }

  // setting up listeners
  zipInput.addEventListener("input", () => {
    // Calculate validity of the input.
    if (extractZip(zipInput)) {
      zipInput.setCustomValidity(""); // valid
    } else {
      zipInput.setCustomValidity(t("enter_valid_zipcode"));
    }
  });

  zipInput.addEventListener("focus", () => {
    if (zipInput.value.length === 0) {
      toggleVisibility(geolocationSubmit, true);
    }
    toggleVisibility(myLocation, false);
  });

  zipInput.addEventListener("blur", () => {
    setTimeout(() => {
      toggleVisibility(geolocationSubmit, false);
    }, 200);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      e.target.checkValidity();
    } catch (err) {
      console.error(err);
    }
    opts.zipCallback(zipInput.value);
  });

  geolocationSubmit.addEventListener("click", (e) => {
    e.preventDefault();
    toggleVisibility(myLocation, true);
    handleGeoSearch(opts);
  });

  if (opts.type === "display") {
    handleUrlParamsOnLoad(opts);
  }
};

const handleGeoSearch = (opts) => {
  const myLocation = document.getElementById("js-my-location");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      opts.geoCallback(position.coords.latitude, position.coords.longitude);
    },
    (err) => {
      console.warn(err);
      toggleVisibility(myLocation, false);
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
    opts.geoCallback(lat, lng, zoom);
  } else if (urlParams.get("locate")) {
    handleGeoSearch(opts);
  }
}

const extractZip = (zipInput) => {
  // Extract the five-digit component from a five- or nine-digit zip surrounded
  // by optional whitespace.  This syntax isn't enforced by a pattern attribute,
  // because then the pattern would have to be copied in more than one place.
  const matches = zipInput.value.match(/^\s*(\d{5})(?:-\d{4})?\s*$/);
  if (!matches) {
    return null;
  }

  return matches[1];
};
