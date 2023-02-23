import Service, { inject as service } from '@ember/service';

import ENV from 'pix-certif/config/environment';

export default class Url extends Service {
  @service currentDomain;
  @service intl;

  definedHomeUrl = ENV.rootURL;
  pixAppUrlWithoutExtension = ENV.APP.PIX_APP_URL_WITHOUT_EXTENSION;

  get homeUrl() {
    return this.definedHomeUrl;
  }

  get cguUrl() {
    const currentLanguage = this.intl.t('current-lang');
    if (currentLanguage === 'en') return 'https://pix.org/en-gb/terms-and-conditions';
    return `https://pix.${this.currentDomain.getExtension()}/conditions-generales-d-utilisation`;
  }

  get dataProtectionPolicyUrl() {
    const currentLanguage = this.intl.t('current-lang');
    if (currentLanguage === 'en') return 'https://pix.org/en-gb/personal-data-protection-policy';
    return `https://pix.${this.currentDomain.getExtension()}/politique-protection-donnees-personnelles-app`;
  }

  get forgottenPasswordUrl() {
    const currentLanguage = this.intl.t('current-lang');
    let url = `${this.pixAppUrlWithoutExtension}${this.currentDomain.getExtension()}/mot-de-passe-oublie`;
    if (currentLanguage === 'en') {
      url += '?lang=en';
    }
    return url;
  }

  get legalNoticeUrl() {
    const topLevelDomain = this.currentDomain.getExtension();
    const currentLanguage = this.intl.t('current-lang');

    if (topLevelDomain === 'fr') return 'https://pix.fr/mentions-legales';

    return currentLanguage === 'fr' ? 'https://pix.org/fr/mentions-legales' : 'https://pix.org/en-gb/legal-notice';
  }

  get accessibilityUrl() {
    const topLevelDomain = this.currentDomain.getExtension();
    const currentLanguage = this.intl.t('current-lang');

    if (topLevelDomain === 'fr') return 'https://pix.fr/accessibilite-pix-certif';

    return currentLanguage === 'fr'
      ? 'https://pix.org/fr/accessibilite-pix-certif'
      : 'https://pix.org/en-gb/accessibility-pix-certif';
  }
}
