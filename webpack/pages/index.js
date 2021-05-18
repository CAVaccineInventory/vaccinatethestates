import { initSearch } from "../search.js";
import { initMap, moveMap, setMapFilter } from "../near-me.js";
import { initFilters } from "../filters.js";
import pfizerLinkTemplate from "../templates/pfizerLink.handlebars";

window.addEventListener("load", () => load());

const load = () => {
  // TODO: remove once we add client side filters
  const urlParams = new URLSearchParams(window.location.search);
  const pfizerTemplate = pfizerLinkTemplate({
    pfizerFiltered: !!urlParams.get("pfizer"),
  });
  document.querySelector(".js-pfizer").innerHTML = pfizerTemplate;

  initFilters((filter) => {
    setMapFilter(filter);
  });

  initMap();
  initSearch(
    {
      locCallback: (lat, lng, zoom, _, siteId) => {
        moveMap(lat, lng, zoom, !siteId, siteId);
      },
    },
    {
      type: "standalone",
      parseQueryParams: true,
    }
  );
};
