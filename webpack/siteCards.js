import siteCard from "./templates/siteCard.handlebars";

const generateCards = (containerId) => {
  // TODO: this is just placeholder

  const fragmentElem = document.createDocumentFragment();
  fragmentElem.innerHTML = "";

  for (let i = 0; i < 50; i++) {
    const range = document.createRange().createContextualFragment(siteCard({}));
    fragmentElem.appendChild(range);
  }

  const containerElem = document.getElementById(containerId);
  containerElem.innerHTML = "";
  containerElem.appendChild(fragmentElem);
};

export { generateCards };
