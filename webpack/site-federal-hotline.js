import siteCardFederalHotlineTemplate from "./templates/siteCardFederalHotline.handlebars";

// Represents and returns the html for the federal vaccine hotline site card
export const siteCardFederalHotline = () => {
  const range = document
    .createRange()
    .createContextualFragment(siteCardFederalHotlineTemplate());

  return range;
};
