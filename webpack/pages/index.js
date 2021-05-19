import { initSearch } from "../search.js";
import { initMap, moveMap, setMapFilter } from "../near-me.js";
import { showFilterButton, initFilters } from "../filters.js";

window.addEventListener("load", () => load());

const load = () => {
  initFilters((filter) => {
    setMapFilter(filter);
  });
  initMap(showFilterButton);
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
