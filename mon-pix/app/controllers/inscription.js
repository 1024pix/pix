import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class InscriptionController extends Controller {
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
    this.router.replaceWith('inscription', { queryParams: { lang: null } });
  }
}
