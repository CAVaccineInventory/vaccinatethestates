/* eslint-disable no-invalid-this */
const fs = require("fs");
const path = require("path");
const util = require("util");
const yaml = require("js-yaml");

const readFile = util.promisify(fs.readFile);
const root = path.join(__dirname, "../..");

async function loadTranslations(ctx) {
  const configPath = path.join(root, "_config.yml");
  ctx.addDependency(configPath);

  const config = yaml.load(await readFile(configPath));
  const langs = config.languages;

  const translations = {};
  await Promise.all(
    langs.map(async (lang) => {
      const translationPath = path.join(root, `_i18n/${lang}.yml`);
      ctx.addDependency(translationPath);

      translations[lang] = yaml.load(await readFile(translationPath));
    })
  );

  const data = {
    defaultLang: langs[0],
    translations,
  };

  return `export default ${JSON.stringify(data)}`;
}

module.exports = function (_source) {
  const callback = this.async();
  loadTranslations(this).then((v) => callback(null, v), callback);
};
