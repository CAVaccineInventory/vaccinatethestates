import { initSearch } from "../search.js";
import { initMap, moveMap, setMapFilter } from "../near-me.js";
import { initFilters } from "../filters.js";

window.addEventListener("load", () => load());

const load = () => {
  initMap(() => {
    initFilters((filter) => {
      setMapFilter(filter);
    });
  });
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
