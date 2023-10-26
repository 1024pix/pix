export default function setupIntl(hooks, locale = ['fr']) {
  hooks.beforeEach(function () {
    this.intl = this.owner.lookup('service:intl');
    this.localeService = this.owner.lookup('service:locale');
    this.localeService.setLocale(locale[0]);
    this.dayjs = this.owner.lookup('service:dayjs');
  });
}
