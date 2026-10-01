import { getContext, settled, waitUntil } from '@ember/test-helpers';
import { setupIntl as setupIntlFromEmberIntl } from 'ember-intl/test-support';
import { formats } from 'pix-orga/ember-intl';
import translationsForDe from 'virtual:ember-intl/translations/de';
import translationsForEn from 'virtual:ember-intl/translations/en';
import translationsForEs from 'virtual:ember-intl/translations/es';
import translationsForFr from 'virtual:ember-intl/translations/fr';
import translationsForIt from 'virtual:ember-intl/translations/it';
import translationsForNl from 'virtual:ember-intl/translations/nl';

const appLocales = {
  de: translationsForDe,
  en: translationsForEn,
  es: translationsForEs,
  fr: translationsForFr,
  it: translationsForIt,
  nl: translationsForNl,
};

export async function setCurrentLocale(locale) {
  const { owner } = getContext();

  const intl = owner.lookup('service:intl');
  intl.setFormats(formats);

  const localeService = owner.lookup('service:locale');
  localeService.setCurrentLocale(locale);
  intl.addTranslations(locale, appLocales[locale]);

  await settled();
}

export async function waitLanguageChanged(locale) {
  const { owner } = getContext();
  await waitUntil(() => owner.lookup('service:intl').primaryLocale === locale);
}

export default function setupIntl(hooks, locale = 'fr') {
  setupIntlFromEmberIntl(hooks, locale);

  hooks.beforeEach(async function () {
    await setCurrentLocale(locale);
  });
}
