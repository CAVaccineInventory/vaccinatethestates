window.addEventListener("load", () => {
  initMobileMenu();
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
