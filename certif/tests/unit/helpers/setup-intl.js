export default function setupIntlForModels(hooks, locale = ['fr']) {
  hooks.beforeEach(function () {
    this.intl = this.owner.lookup('service:intl');
    this.intl.setLocale(locale);
  });
}
