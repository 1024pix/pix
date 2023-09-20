import { setupIntl as setupIntlFromEmberIntl } from 'ember-intl/test-support';

export default function setupIntl(hooks, locale = 'fr') {
  setupIntlFromEmberIntl(hooks, locale);

  hooks.beforeEach(function () {
    this.localeService = this.owner.lookup('service:locale');
    this.localeService.setLocale(locale);
    this.dayjs = this.owner.lookup('service:dayjs');
  });
}
