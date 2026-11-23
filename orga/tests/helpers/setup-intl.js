import { getContext, settled, waitUntil } from '@ember/test-helpers';
import { setupIntl as setupIntlFromEmberIntl } from 'ember-intl/test-support';
import { formats } from 'pix-orga/ember-intl';

export async function setCurrentLocale(locale) {
  const { owner } = getContext();

  const intl = owner.lookup('service:intl');
  intl.setFormats(formats);

  const localeService = owner.lookup('service:locale');
  await localeService.setCurrentLocale(locale);

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

export function t(key, options) {
  const intl = getContext().owner.lookup('service:intl');
  if (!intl.exists(key)) {
    throw new Error(`Missing translation for key "${key}"`);
  }
  return intl.t(key, options);
}
