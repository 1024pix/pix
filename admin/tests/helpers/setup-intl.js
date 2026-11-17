import { getContext, settled } from '@ember/test-helpers';
import { setupIntl as setupIntlFromEmberIntl, t } from 'ember-intl/test-support';
import { formats } from 'pix-admin/ember-intl';
import translationsForEn from 'virtual:ember-intl/translations/en';
import translationsForFr from 'virtual:ember-intl/translations/fr';

const appLocales = {
  en: translationsForEn,
  fr: translationsForFr,
};

export async function setCurrentLocale(locale) {
  const { owner } = getContext();

  const intl = owner.lookup('service:intl');
  intl.setFormats(formats);
  intl.addTranslations(locale, appLocales[locale]);

  const localeService = owner.lookup('service:locale');
  localeService.setCurrentLocale(locale);

  await settled();
}

export default function setupIntl(hooks, locale = 'fr') {
  setupIntlFromEmberIntl(hooks, locale);
  hooks.beforeEach(async function () {
    await setCurrentLocale(locale);
  });
}

export { t };
