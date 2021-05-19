import { toggleVisibility } from "./utils/dom.js";
import pfizerLinkTemplate from "./templates/pfizerLink.handlebars";

let filterPfizer;
let filterJJ;
let filterModerna;
let filterUnknown;
let modernaInput;
let pfizerInput;
let jjInput;
let unknownInput;

const showFilterButton = () => {
  document.querySelector(".js-filter-button").classList.remove("invisible");
};

const initFilters = (callback) => {
  const cb = () => {
    toggleActiveIcon();
    callback(createMapboxFilter());
    setupPfizerLink(cb);
  };

  const urlParams = new URLSearchParams(window.location.search);

  filterPfizer = !!urlParams.get("pfizer");
  filterJJ = !!urlParams.get("jj");
  filterModerna = !!urlParams.get("moderna");
  filterUnknown = !!urlParams.get("unknown");

  const dropdown = document.querySelector(".js-filter-dropdown");

  window.addEventListener("click", () => {
    // any outside click closes the dropdown
    toggleVisibility(dropdown, false);
  });

  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.querySelector(".js-filter-button").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleVisibility(dropdown, dropdown.classList.contains("hidden"));
  });

  modernaInput = dropdown.querySelector(".js-moderna-filter");
  pfizerInput = dropdown.querySelector(".js-pfizer-filter");
  jjInput = dropdown.querySelector(".js-jj-filter");
  unknownInput = dropdown.querySelector(".js-unknown-filter");
  modernaInput.checked = filterModerna;
  pfizerInput.checked = filterPfizer;
  jjInput.checked = filterJJ;
  unknownInput.checked = filterUnknown;

  modernaInput.addEventListener("change", () => {
    filterModerna = !!modernaInput.checked;
    cb();
  });
  pfizerInput.addEventListener("change", () => {
    filterPfizer = !!pfizerInput.checked;
    cb();
  });
  jjInput.addEventListener("change", () => {
    filterJJ = !!jjInput.checked;
    cb();
  });
  unknownInput.addEventListener("change", () => {
    filterUnknown = !!unknownInput.checked;
    cb();
  });

  toggleActiveIcon();
  setupPfizerLink(cb);
};

const getFilterQueryParams = () => {
  const params = {};
  if (filterPfizer) {
    params.pfizer = 1;
  }
  if (filterModerna) {
    params.moderna = 1;
  }
  if (filterJJ) {
    params.jj = 1;
  }
  if (filterUnknown) {
    params.unknown = 1;
  }
  return params;
};

const createMapboxFilter = () => {
  let filter = null;
  if (filterPfizer || filterJJ || filterModerna || filterUnknown) {
    filter = ["any"];
    if (filterPfizer) {
      filter.push(["==", ["get", "vaccine_pfizer"], true]);
    }
    if (filterJJ) {
      filter.push(["==", ["get", "vaccine_jj"], true]);
    }
    if (filterModerna) {
      filter.push(["==", ["get", "vaccine_moderna"], true]);
    }
    if (filterUnknown) {
      filter.push([
        "all",
        ["!", ["has", "vaccine_pfizer"]],
        ["!", ["has", "vaccine_jj"]],
        ["!", ["has", "vaccine_moderna"]],
      ]);
    }
  }
  return filter;
};

const setupPfizerLink = (callback) => {
  const pfizerNotice = document.querySelector(".js-pfizer");
  if (pfizerNotice) {
    pfizerNotice.innerHTML = "";
    const pfizerTemplate = pfizerLinkTemplate({
      pfizerFiltered:
        filterPfizer && !filterJJ && !filterModerna && !filterUnknown,
    });
    const range = document
      .createRange()
      .createContextualFragment(pfizerTemplate);

    range.querySelector("a").addEventListener("click", (e) => {
      e.preventDefault();

      if (filterPfizer && !filterJJ && !filterModerna && !filterUnknown) {
        filterPfizer = false;
      } else {
        filterPfizer = true;
        filterJJ = false;
        filterModerna = false;
        filterUnknown= false;
      }

      modernaInput.checked = filterModerna;
      pfizerInput.checked = filterPfizer;
      jjInput.checked = filterJJ;
      unknownInput.checked = filterUnknown;

      callback();
    });

    pfizerNotice.appendChild(range);
  }
};

const toggleActiveIcon = () => {
  const inactiveIcon = document.querySelector(".js-filter-inactive");
  const activeIcon = document.querySelector(".js-filter-active");

  if (filterPfizer || filterJJ || filterModerna || filterUnknown) {
    toggleVisibility(inactiveIcon, false);
    toggleVisibility(activeIcon, true);
  } else {
    toggleVisibility(inactiveIcon, true);
    toggleVisibility(activeIcon, false);
  }
};

export {
  showFilterButton,
  initFilters,
  getFilterQueryParams,
  createMapboxFilter,
};
