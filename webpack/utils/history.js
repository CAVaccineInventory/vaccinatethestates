export const replaceState = (opts) => {
  const urlParams = new URLSearchParams(window.location.search);
  const newParams = new URLSearchParams();
  ["pfizer", "moderna", "jj"].forEach((vaccine) => {
    const param = urlParams.get(vaccine);
    if (param) {
      newParams.set(vaccine, param);
    }
  });
  const { lat, lng, zoom } = opts;
  newParams.set("lat", Math.round(lat * 1000) / 1000);
  newParams.set("lng", Math.round(lng * 1000) / 1000);
  newParams.set("zoom", Math.round(zoom * 1000) / 1000);
  history.replaceState({}, "", `?${newParams.toString()}`);
};
