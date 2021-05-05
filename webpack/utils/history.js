export const replaceState = (opts) => {
  let { lat, lng, zoom } = opts;
  lat = Math.round(lat * 1000) / 1000;
  lng = Math.round(lng * 1000) / 1000;
  zoom = Math.round(zoom * 1000) / 1000;
  history.replaceState({}, "", `?lat=${lat}&lng=${lng}&zoom=${zoom}`);
};
