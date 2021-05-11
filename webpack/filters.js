import { toggleVisibility } from "./utils/dom.js";
let filterPfizer;
let filterJJ;
let filterModerna;

const initFilters = (callback) => {
  const urlParams = new URLSearchParams(window.location.search);
  filterPfizer = !!urlParams.get("pfizer");
  filterJJ = !!urlParams.get("jj");
  filterModerna = !!urlParams.get("moderna");

  const dropdown = document.querySelector(".js-filter-dropdown");

  window.addEventListener('click', () => {
    // any outside click closes the dropdown
    toggleVisibility(dropdown, false);
  })

  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  })

  document.querySelector(".js-filter-button").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleVisibility(dropdown, dropdown.classList.contains("hidden"));
  })


  const modernaInput = dropdown.querySelector(".js-moderna-filter");
  const pfizerInput = dropdown.querySelector(".js-pfizer-filter");
  const jjInput = dropdown.querySelector(".js-jj-filter");
  modernaInput.checked = filterModerna;
  pfizerInput.checked = filterPfizer;
  jjInput.checked = filterJJ;

  modernaInput.addEventListener("change", () => {
    filterModerna = !!modernaInput.checked;
    callback(createMapboxFilter());
  })
  pfizerInput.addEventListener("change", () => {
    filterPfizer = !!pfizerInput.checked;
    callback(createMapboxFilter());
  })
  jjInput.addEventListener("change", () => {
    filterJJ = !!jjInput.checked;
    callback(createMapboxFilter());
  })
}

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
}

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


export { initFilters, getFilterQueryParams, createMapboxFilter };