// Call i18n-loader with argument "" (i.e. no argument, since i18n-loader
// doesn't take one)
import i18n from "i18n-loader!";

const { translations, defaultLang } = i18n;

export { translations };

function lookup(key, translations) {
  const [head] = key.split(".", 1);
  const tail = key.slice(head.length + 1);
  const val = translations[head];
  if (tail.length > 0) {
    return lookup(tail, val);
  }
  return val;
}

export function t(key, values = {}, lang = undefined) {
  if (!lang) {
    lang = document.documentElement.getAttribute("lang");
  }

  const translated = translations[lang] || {};
  const untranslated = translations[defaultLang];

  let str;
  try {
    str = lookup(key, translated);
  } catch (_e) {}

  if (!str) {
    try {
      str = lookup(key, untranslated);
    } catch (_e) {}
  }

  if (values && str) {
    for (const key in values) {
      if (values.hasOwnProperty(key)) {
        str = str.replace(`{{${key}}}`, values[key]);
      }
    }
  }
  return str;
}
