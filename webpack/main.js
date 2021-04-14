import "regenerator-runtime/runtime";
import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";

/**
 * This is site wide JS. Add sparingly.
 */
window.addEventListener("load", () => {
  initMobileMenu();
  initSentry();
});

const initMobileMenu = () => {
  const mobileMenuActivator = document.querySelector(
    ".js-mobile-menu-activator"
  );
  const mobileMenuDeactivator = document.querySelector(
    ".js-mobile-menu-deactivator"
  );
  const mobileMenu = document.querySelector(".js-mobile-menu");
  document
    .querySelector(".js-mobile-menu-button")
    .addEventListener("click", (e) => {
      mobileMenuActivator.classList.toggle("hidden");
      mobileMenuActivator.classList.toggle("block");

      mobileMenuDeactivator.classList.toggle("hidden");
      mobileMenuDeactivator.classList.toggle("block");

      mobileMenu.classList.toggle("hidden");
      mobileMenu.classList.toggle("block");

      e.preventDefault();
    });
};

const initSentry = () => {
  Sentry.init({
    dsn:
      "https://7b52413f154242aba5a7f5fb2034d9f2@o509416.ingest.sentry.io/5716706",
    integrations: [new Integrations.BrowserTracing()],

    // Trace 20% of transactions sent to Sentry
    tracesSampleRate: 0.2,
  });
};
