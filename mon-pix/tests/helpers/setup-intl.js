export default function setupIntl(hooks, locale = ['fr']) {
  hooks.beforeEach(function () {
    this.intl = this.owner.lookup('service:intl');
    this.intl.setLocale(locale);
  });
}
