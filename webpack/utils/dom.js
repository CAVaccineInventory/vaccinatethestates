export function toggleVisibility(element, isVisible) {
  if (element) {
    if (isVisible) {
      element.classList.remove("hidden");
    } else {
      element.classList.add("hidden");
    }
  }
}
