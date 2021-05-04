import { initSearch } from "./search.js";
import { initMap, moveMap } from "./near-me.js";
import { toggleVisibility } from "./utils/dom.js";

window.addEventListener("load", () => load());

const load = () => {
  // if url params present, hide zoomed out view to avoid flash
  toggleVisibility(
    document.querySelector("#zoomed_out_view"),
    !window.location.search
  );

  initMap();
  initSearch(
    {
      locCallback: (lat, lng, zoom, source) => {
        if (source === "mapbox-control") {
          // mapbox control already moves for us, just update history
          history.pushState({}, "", `?lat=${lat}&lng=${lng}&zoom=${zoom}`);
        } else {
          moveMap(lat, lng, zoom, false);
        }
      },
    },
    {
      type: "map",
      parseQueryParams: true,
    }
  );
};
