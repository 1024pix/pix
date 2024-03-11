import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class LoginOrRegister extends Component {
  @service currentDomain;
  @service locale;
  @service intl;
  @service router;
  @tracked displayRegisterForm = true;
  @tracked selectedLanguage = this.intl.primaryLocale;

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  @action
  toggleFormsVisibility() {
    this.displayRegisterForm = !this.displayRegisterForm;
  }

  @action
  onLanguageChange(value) {
    this.selectedLanguage = value;
    this.locale.setLocale(this.selectedLanguage);
    this.router.replaceWith('join', {
      queryParams: {
        lang: null,
      },
    });
  }
}
