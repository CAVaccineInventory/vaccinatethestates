import { DateTime } from "luxon";
import siteCardTemplate from "./templates/siteCard.handlebars";
import { markdownify } from "./utils/markdown.js";
import ClipboardJS from 'clipboard';

const phoneRegex = /^\s*(\+?\d{1,2}(\s|-)*)?(\(\d{3}\)|\d{3})(\s|-)*\d{3}(\s|-)*\d{4}\s*$/;

export const siteCard = (props, coordinates) => {
  const site = new Site(props, coordinates);
  const range = document
    .createRange()
    .createContextualFragment(siteCardTemplate(site.context()));
  const details = range.querySelector("details");
  details.addEventListener("click", (e) => {
    e.stopPropagation();
    details.blur();
  });

  const copyButton = range.querySelector('.js-copy-button');
  copyButton.addEventListener("click", (e) => {
    e.stopPropagation();
  })
  new ClipboardJS(copyButton);
  return range;
};

class Site {
  constructor(properties, coordinates) {
    this.properties = properties;
    this.coordinates = coordinates;
  }

  action() {
    // Warning, scary shores ahead! We try to rely on appointment_method to determine the CTA,
    // but because appointment_details is freeform text, we try to use it if it's for sure a
    // link or phone number. Otherwise fallback to known location phone numbers and websites.
    const method = this.properties["appointment_method"] || "";
    const details = (this.properties["appointment_details"] || "").trim();
    const detailsIsPhone = details.match(phoneRegex);
    let detailsIsUrl = false;
    try {
      new URL(details);
      detailsIsUrl = true;
    } catch (e) {}

    // sometimes our websites are entered without http/https in front which will break link tags
    let website = this.properties["website"];
    if (website && !website.startsWith("http")) {
      website = `//${website}`;
    }

    if (method === "web" && detailsIsUrl) {
      return {
        isSite: true,
        label: "book_appt",
        href: details,
      };
    } else if (method === "phone" && detailsIsPhone) {
      return {
        isSite: false,
        label: "call",
        href: `tel:${details}`,
      };
    } else if (website) {
      return {
        isSite: true,
        label: "visit_site",
        href: website,
      };
    } else if (this.properties["phone_number"]) {
      return {
        isSite: false,
        label: "call",
        href: `tel:${this.properties["phone_number"]}`,
      };
    }
  }

  googleMapsLink() {
    if (this.properties["address"]) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        this.properties["address"]
      )}`;
    } else {
      return null;
    }
  }
  hasMoreInfo() {
    return this.properties["phone_number"] || this.properties["website"];
  }
  appointmentDetails() {
    return this.properties["appointment_details"]
      ? markdownify(this.properties["appointment_details"])
      : null;
  }
  notes() {
    return this.properties["public_notes"]
      ? markdownify(this.properties["public_notes"])
      : null;
  }
  lastVerified() {
    const timestamp = this.properties["latest_contact"];
    if (!timestamp) {
      return null;
    }
    const locale = document.documentElement.getAttribute("lang");
    return DateTime.fromISO(timestamp, { locale }).toRelative();
  }
  availability() {
    const appointments = !!this.properties["available_appointments"];
    const walkins = !!this.properties["available_walkins"];
    return {
      availabilityKnown: appointments || walkins,
      appointments,
      walkins,
    };
  }
  offeredVaccines() {
    const offersModerna = !!this.properties["vaccine_moderna"];
    const offersPfizer = !!this.properties["vaccine_pfizer"];
    const offersJJ = !!this.properties["vaccine_jj"];
    return {
      vaccinesKnown: offersModerna || offersPfizer || offersJJ,
      offersModerna,
      offersPfizer,
      offersJJ,
    };
  }
  shareUrl() {
    const url = new URL(window.location.origin);
    url.searchParams.set("lng", this.coordinates[0]);
    url.searchParams.set("lat", this.coordinates[1]);
    url.hash = this.properties["id"];
    return url.toString();
  }
  context() {
    return {
      id: this.properties["id"],
      name: this.properties["name"],
      address: this.properties["address"],
      addressLink: this.googleMapsLink(),
      action: this.action(),
      hours: this.properties["hours"],
      moreInfo: this.hasMoreInfo(),
      website: this.properties["website"],
      phoneNumber: this.properties["phone_number"],
      appointmentDetails: this.appointmentDetails(),
      notes: this.notes(),
      vaccinefinder: this.properties.hasOwnProperty(
        "vaccinefinder_location_id"
      ),
      vaccinespotter: this.properties.hasOwnProperty(
        "vaccinespotter_location_id"
      ),
      google: this.properties.hasOwnProperty("google_place_id"),
      lastVerified: this.lastVerified(),
      shareUrl: this.shareUrl(),
      ...this.availability(),
      ...this.offeredVaccines(),
    };
  }
}
