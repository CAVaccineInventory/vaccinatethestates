import { getFilterQueryParams } from "../filters.js";

export const replaceState = (opts) => {
  const newParams = new URLSearchParams();
  const filterParams = getFilterQueryParams();
  for (const [key, value] of Object.entries(filterParams)) {
    newParams.set(key, value);
  }

  const { lat, lng, zoom } = opts;
  newParams.set("lat", Math.round(lat * 1000) / 1000);
  newParams.set("lng", Math.round(lng * 1000) / 1000);
  newParams.set("zoom", Math.round(zoom * 1000) / 1000);
  history.replaceState({}, "", `?${newParams.toString()}`);
};
