import { t } from "./i18n.js";
import { getCurrentPosition } from "./utils/geolocation.js";
import embedGeolocatorTemplate from "./templates/embedGeolocator.handlebars";

// Implements the mapbox control interface
export class EmbedGeolocator {
  constructor(callback) {
    this.container = null;
    this.callback = callback;
  }
  onAdd() {
    const range = document
      .createRange()
      .createContextualFragment(embedGeolocatorTemplate());
    const button = range.querySelector(".js-geolocator");

    button.addEventListener("click", (e) => {
      e.preventDefault;
      button.textContent = t("getting_location");
      button.blur();
      getCurrentPosition(
        (lat, lng) => {
          button.textContent = t("locations_near_me");
          this.callback(lat, lng);
        },
        () => {
          button.textContent = t("locations_near_me");
          alert(t("alert_detect"));
        }
      );
    });

    this.container = range;
    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
  }
}
