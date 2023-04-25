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

  queryParams = ['lang'];
  availableLanguages = [
    { label: 'Français', value: 'fr' },
    { label: 'English', value: 'en' },
  ];

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  @action
  onLanguageChange(value) {
    const queryParams = { lang: null };
    this.selectedLanguage = value;
    this._setLocale(this.selectedLanguage);
    this.router.replaceWith('inscription', { queryParams });
  }

  _setLocale(language) {
    this.intl.setLocale([language, DEFAULT_LOCALE]);
    this.dayjs.setLocale(language);
  }
}
