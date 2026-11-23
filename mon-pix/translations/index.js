export const TRANSLATION_LOADERS = {
  de: () => import('virtual:ember-intl/translations/de'),
  en: () => import('virtual:ember-intl/translations/en'),
  es: () => import('virtual:ember-intl/translations/es'),
  'es-419': () => import('virtual:ember-intl/translations/es-419'),
  fr: () => import('virtual:ember-intl/translations/fr'),
  it: () => import('virtual:ember-intl/translations/it'),
  nl: () => import('virtual:ember-intl/translations/nl'),
};
