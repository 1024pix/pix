export default function missingMessage(key, locales) {
  throw new Error(`[ember-intl] Missing translation for key: "${key}" for locales: "${locales}"`);
}
