
export default function setupIntl(locale = ['fr']) {
  beforeEach(function() {
    this.intl = this.owner.lookup('service:intl');
    this.intl.setLocale(locale);
  });
}
