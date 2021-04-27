import { initSearch } from "./search.js";
import { initMap, moveMap } from "./near-me.js";

window.addEventListener("load", () => load());

const load = () => {
  initMap({ renderZoomedOutView: true });
  initSearch(
    {
      locCallback: (lat, lng, zoom, source) => {
        if (source === "search") {
          history.pushState({}, "", `?lat=${lat}&lng=${lng}&zoom=${zoom}`);
        }
        moveMap(lat, lng, zoom, true);
      },
    },
    {
      type: "standalone",
    }
  );
};
