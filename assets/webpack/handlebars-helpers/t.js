import { t as translate } from "../i18n.js";

const t = (id, options) => {
  return translate(id, options.hash);
};

export default t;
