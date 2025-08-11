import { getContext, settled } from '@ember/test-helpers';
import { setupIntl as setupIntlFromEmberIntl } from 'ember-intl/test-support';

export async function setCurrentLocale(locale) {
  const { owner } = getContext();

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
