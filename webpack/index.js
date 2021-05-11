import { initSearch } from "./search.js";
import { initMap, moveMap } from "./near-me.js";
import { initFilters } from "./filters.js";

window.addEventListener("load", () => load());

const load = () => {
  initFilters();
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
