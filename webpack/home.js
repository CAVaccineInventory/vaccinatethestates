import { initSearch } from "./search.js";

window.addEventListener("load", () => {
  initSearch((event) => {
    if (event.type === "zip") {
        const lang = document.documentElement.getAttribute("lang");
        window.location.href = lang === "en" ? `/near-me?zip=${event.value}` : `/${lang}/near-me?zip=${event.value}`;
    } else if (event.type === "geolocation") {
        window.location.href = lang === "en" ? `/near-me?locate=1` : `/${lang}/near-me?locate=1`;
    }
  });
});
