import { toggleVisibility } from "./utils/dom.js";
import pfizerLinkTemplate from "./templates/pfizerLink.handlebars";

let filterPfizer;
let filterJJ;
let filterModerna;
let modernaInput;
let pfizerInput;
let jjInput;

const initFilters = (callback) => {
  document.querySelector(".js-filter-button").classList.remove("invisible");

  const cb = () => {
    callback(createMapboxFilter());
  };

  const urlParams = new URLSearchParams(window.location.search);

  filterPfizer = !!urlParams.get("pfizer");
  filterJJ = !!urlParams.get("jj");
  filterModerna = !!urlParams.get("moderna");

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
  modernaInput.checked = filterModerna;
  pfizerInput.checked = filterPfizer;
  jjInput.checked = filterJJ;

  modernaInput.addEventListener("change", () => {
    filterModerna = !!modernaInput.checked;
    cb();
  });
  pfizerInput.addEventListener("change", () => {
    filterPfizer = !!pfizerInput.checked;
    cb();
    setupPfizerLink(callback);
  });
  jjInput.addEventListener("change", () => {
    filterJJ = !!jjInput.checked;
    cb();
  });

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
  return params;
};

const createMapboxFilter = () => {
  let filter = null;
  if (filterPfizer || filterJJ || filterModerna) {
    filter = ["all"];
    if (filterPfizer) {
      filter.push(["==", ["get", "vaccine_pfizer"], true]);
    }
    if (filterJJ) {
      filter.push(["==", ["get", "vaccine_jj"], true]);
    }
    if (filterModerna) {
      filter.push(["==", ["get", "vaccine_moderna"], true]);
    }
  }
  return filter;
};

const setupPfizerLink = (callback) => {
  const pfizerNotice = document.querySelector(".js-pfizer");
  if (pfizerNotice) {
    pfizerNotice.innerHTML = "";
    const pfizerTemplate = pfizerLinkTemplate({
      pfizerFiltered: filterPfizer,
    });
    const range = document
      .createRange()
      .createContextualFragment(pfizerTemplate);

    range.querySelector("a").addEventListener("click", (e) => {
      e.preventDefault();

      if (filterPfizer) {
        filterPfizer = false;
        filterJJ = false;
        filterModerna = false;
      } else {
        filterPfizer = true;
        filterJJ = false;
        filterModerna = false;
      }

      modernaInput.checked = filterModerna;
      pfizerInput.checked = filterPfizer;
      jjInput.checked = filterJJ;

      callback();
      setupPfizerLink(callback);
    });

    pfizerNotice.appendChild(range);
  }
};

export { initFilters, getFilterQueryParams, createMapboxFilter };
