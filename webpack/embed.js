import { initSearch } from "./search.js";
import { initMap, moveMap } from "./near-me.js";
import { toggleVisibility } from "./utils/dom.js";

window.addEventListener("load", () => load());

const load = () => {
  // if url params present, hide zoomed out view to avoid flash
  toggleVisibility(document.querySelector("#zoomed_out_view"), !window.location.search);

  initMap();
  initSearch(
    {
      locCallback: (lat, lng, zoom, _) => {
        moveMap(lat, lng, zoom, false);
      },
    },
    {
      type: "map",
      parseQueryParams: true,
    }
  );
};
