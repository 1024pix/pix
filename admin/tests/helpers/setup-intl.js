export default function setupIntl(hooks, locale = ['fr']) {
  hooks.beforeEach(function () {
    this.intl = this.owner.lookup('service:intl');
    this.intl.setLocale(locale);

    this.dayjs = this.owner.lookup('service:dayjs');
    this.dayjs.setLocale(locale[0]);
    this.dayjs.self.locale(locale[0]);
  });
}
