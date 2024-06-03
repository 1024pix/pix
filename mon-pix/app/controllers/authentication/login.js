import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class LoginController extends Controller {
  @service currentDomain;
  @service intl;
  @service locale;
  @service router;

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  get selectedLanguage() {
    return this.intl.primaryLocale;
  }

  @action
  onLanguageChange(language) {
    this.locale.setLocale(language);
    this.router.replaceWith('authentication.login', { queryParams: { lang: null } });
  }
}
