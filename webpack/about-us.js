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
    { type: "standalone", parseQueryParams: true }
  );

  const peopleElements = [...document.querySelectorAll("#js-people-list a")];
  const peopleListElement = document.getElementById("js-people-list");

  shuffleArray(peopleElements);
  peopleListElement.innerHTML = "";
  for (let i = 0; i < peopleElements.length; ++i) {
    const personElement = peopleElements[i];

    peopleListElement.insertBefore(personElement, null);
    if (i !== peopleElements.length - 1) {
      const separatorNode = document.createTextNode(", ");
      peopleListElement.insertBefore(separatorNode, null);
    }
  }
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
