import { initSearch } from "./search.js";

window.addEventListener("load", () => {
  initSearch(
    {
      locCallback: (lat, lng, zoom, _) => {
        const lang = document.documentElement.getAttribute("lang");
        window.location.href =
          lang === "en"
            ? `/?lat=${lat}&lng=${lng}&zoom=${zoom}`
            : `/${lang}?lat=${lat}&lng=${lng}&zoom=${zoom}`;
      },
    },
    false
  );
});
