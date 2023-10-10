import { setupIntl as setupIntlFromEmberIntl } from 'ember-intl/test-support';

export default function setupIntl(hooks, locale = 'fr') {
  setupIntlFromEmberIntl(hooks, locale);

  hooks.beforeEach(function () {
    this.dayjs = this.owner.lookup('service:dayjs');
    this.dayjs.setLocale(locale);
  });
}
