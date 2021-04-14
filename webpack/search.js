import { t } from "./i18n.js";

/**
 * Initializes the search JS.
 * @param {Object} opts - options for initialization as follows in pseudo typescript:
 * initSearch: (opts: Options) => void;
 * type Options = Navigate | Display
 *
 *
 * // For navigating to near-me
 * interface Navigate {
 *   type: "navigate"
 * }
 *
 * // For displaying content on near-me
 * interface Display {
 *   type: "display",
 *   zipCallback: (zip: number) => void,
 *   geoCallback: (lat: number, lon: number) => void
 *   geoErrorCallback: () => void
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
    handleZipSearch(opts, zipInput.value);
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

const handleZipSearch = (opts, zip) => {
  if (opts.type === "navigate") {
    const lang = document.documentElement.getAttribute("lang");
    window.location.href =
      lang === "en" ? `/near-me?zip=${zip}` : `/${lang}/near-me?zip=${zip}`;
  } else if (opts.type === "display") {
    opts.zipCallback(zip);
  }
};

const handleGeoSearch = (opts) => {
  const myLocation = document.getElementById("js-my-location");
  if (opts.type === "navigate") {
    const lang = document.documentElement.getAttribute("lang");
    window.location.href =
      lang === "en" ? "/near-me?locate=1" : `/${lang}/near-me?locate=1`;
  } else if (opts.type === "display") {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        opts.geoCallback(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        console.warn(err);
        toggleVisibility(myLocation, false);
        opts.geoErrorCallback();
      },
      {
        maximumAge: 1000 * 60 * 5, // 5 minutes
        timeout: 1000 * 15, // 15 seconds
      }
    );
  }
};

function handleUrlParamsOnLoad(opts) {
  const urlParams = new URLSearchParams(window.location.search);
  const zip = urlParams.get("zip");
  const lat = urlParams.get("lat");
  const lon = urlParams.get("lon");
  if (zip) {
    const zipInput = document.getElementById("js-zip-input");
    if (zipInput) {
      zipInput.value = zip;
    }
    opts.zipCallback(zip);
  } else if (lat && lon) {
    opts.geoCallback(lat, lon);
  } else if (urlParams.get("locate")) {
    handleGeoSearch(opts);
  }
}

function toggleVisibility(element, isVisible) {
  if (element) {
    if (isVisible) {
      element.classList.remove("hidden");
    } else {
      element.classList.add("hidden");
    }
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
