import { initSearch } from "./search.js";
import { initMap, moveMap } from "./near-me.js";

window.addEventListener("load", () => load());

const load = () => {
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
