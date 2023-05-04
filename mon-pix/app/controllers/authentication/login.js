import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class LoginController extends Controller {
  @service currentDomain;
  @service intl;
  @service locale;
  @service router;

  @tracked selectedLanguage = this.intl.primaryLocale;

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  @action
  onLanguageChange(language) {
    this.selectedLanguage = language;
    this.locale.setLocale(this.selectedLanguage);
    this.router.replaceWith('authentication.login', { queryParams: { lang: null } });
  }
}
