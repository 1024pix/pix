import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

const DEFAULT_LOCALE = 'fr';

export default class InscriptionController extends Controller {
  @service intl;
  @service dayjs;
  @service currentDomain;
  @service router;

  @tracked selectedLanguage = this.intl.primaryLocale;

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  @action
  onLanguageChange(value) {
    this.selectedLanguage = value;
    this._setLocale(this.selectedLanguage);
    this.router.replaceWith('inscription', { queryParams: { lang: null } });
  }

  _setLocale(language) {
    this.intl.setLocale([language, DEFAULT_LOCALE]);
    this.dayjs.setLocale(language);
  }
}
