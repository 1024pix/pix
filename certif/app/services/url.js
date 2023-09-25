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
    if (this.currentDomain.isFranceDomain) return 'https://pix.fr/mentions-legales';

    const currentLanguage = this.intl.t('current-lang');
    return currentLanguage === 'fr' ? 'https://pix.org/fr/mentions-legales' : 'https://pix.org/en-gb/legal-notice';
  }

  get accessibilityUrl() {
    if (this.currentDomain.isFranceDomain) return 'https://pix.fr/accessibilite-pix-certif';

    const currentLanguage = this.intl.t('current-lang');
    return currentLanguage === 'fr'
      ? 'https://pix.org/fr/accessibilite-pix-certif'
      : 'https://pix.org/en-gb/accessibility-pix-certif';
  }

  get supportUrl() {
    if (this.currentDomain.isFranceDomain) return 'https://support.pix.fr';

    const currentLanguage = this.intl.t('current-lang');
    return currentLanguage === 'fr' ? 'https://support.pix.org' : 'https://support.pix.org/en/support/home';
  }

  get joiningIssueSheetUrl() {
    const currentLanguage = this.intl.t('current-lang');
    if (currentLanguage === 'fr') {
      return 'https://cloud.pix.fr/s/zf3fGimWwPQCeWF/download/Probl%C3%A8mes%20d%27acc%C3%A8s%20en%20session.pdf';
    }

    return 'https://cloud.pix.fr/s/JmBn2q5rpzgrjxN/download';
  }
}
