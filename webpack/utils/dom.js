export function toggleVisibility(element, isVisible) {
  if (element) {
    if (isVisible) {
      element.classList.remove("hidden");
    } else {
      element.classList.add("hidden");
    }
  }
}

export const isSelected = (element) =>
  element && element.classList.contains("is-selected");

export const select = (element) =>
  element && element.classList.add("is-selected");

export const deselect = (element) =>
  element && element.classList.remove("is-selected");