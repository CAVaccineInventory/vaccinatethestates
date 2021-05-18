import { initSearch } from "../search.js";
import { initMap, moveMap, setMapFilter } from "../near-me.js";
import { initFilters } from "../filters.js";
import { toggleVisibility } from "../utils/dom.js";

window.addEventListener("load", () => load());

const load = () => {
  // if url params present, hide zoomed out view to avoid flash
  toggleVisibility(
    document.querySelector("#zoomed_out_view"),
    !window.location.search
  );

  initFilters((filter) => {
    setMapFilter(filter);
  });
  initMap();
  initSearch(
    {
      locCallback: (lat, lng, zoom, source, siteId) => {
        moveMap(lat, lng, zoom, source === "locate", siteId);
      },
    },
    {
      type: "map",
      parseQueryParams: true,
    }
  );
};
