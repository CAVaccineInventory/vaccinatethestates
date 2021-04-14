import { t } from "./i18n.js";

/**
 * Initializes the search form JS
 * Calls back searchCallback on a search event. In pseudo typescript:
 * 
 * searchCallback: () => GeoResponse | ZipResponse
 * 
 * interface ZipResponse {
 *   type: "zip",
 *   value: number
 * }
 * 
 * interface GeoResponse {
 *   type: "geolocation" 
 *   lat: number,
 *   lon: number
 * }
 */
export const initSearch = (searchCallback) => {
  const form = document.getElementById("js-submit-zip-form");
  const zipInput = document.getElementById("js-zip-input");
  const geolocationSubmit = document.getElementById("js-submit-geolocation");
  const myLocation = document.getElementById("js-my-location");

  if (!zipInput) {
    return;
  }

  // setting up listeners
  zipInput.addEventListener("input", (e) => {
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

  zipInput.addEventListener("blur", (e) => {
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
    searchCallback({
        type: "zip",
        value: zipInput.value,
    });
  });

  geolocationSubmit.addEventListener("click", (e) => {
    e.preventDefault();
    submitGeoLocation(searchCallback);
  });

  // TODO: parse query params to immediately callback
};

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


async function submitGeoLocation(callback) {
    const button = document.getElementById("js-submit-geolocation");
    //toggleSubmitButtonState(button, false);
    button.value = "Locating...";
  
    navigator.geolocation.getCurrentPosition(
        (position) => {
            console.log("wow");
            callback({
                type: "geolocation",
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            });
        }, () => {
            // TODO error
        },
        {
            maximumAge: 1000 * 60 * 5, // 5 minutes
            timeout: 1000 * 15, // 15 seconds
        }
    );
  }