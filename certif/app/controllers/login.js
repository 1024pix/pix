import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class LoginController extends Controller {
  @service intl;
  @service currentDomain;
  @service router;
  @service locale;

  @tracked selectedLanguage = this.intl.primaryLocale;

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  @action
  onLanguageChange(value) {
    this.selectedLanguage = value;
    this.locale.setLocale(this.selectedLanguage);
    this.router.replaceWith('login', { queryParams: { lang: null } });
  }
}
