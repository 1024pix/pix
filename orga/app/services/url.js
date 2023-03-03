import Service, { inject as service } from '@ember/service';

import ENV from 'pix-orga/config/environment';

const FRENCH_DOMAIN_EXTENSION = 'fr';

export default class Url extends Service {
  @service currentDomain;
  @service intl;

  definedCampaignsRootUrl = ENV.APP.CAMPAIGNS_ROOT_URL;
  pixAppUrlWithoutExtension = ENV.APP.PIX_APP_URL_WITHOUT_EXTENSION;

  definedHomeUrl = ENV.rootURL;

  get isFrenchDomainExtension() {
    return this.currentDomain.getExtension() === FRENCH_DOMAIN_EXTENSION;
  }

  get campaignsRootUrl() {
    return this.definedCampaignsRootUrl
      ? this.definedCampaignsRootUrl
      : `${this.pixAppUrlWithoutExtension}${this.currentDomain.getExtension()}/campagnes/`;
  }

  get homeUrl() {
    const currentLanguage = this.intl.get('primaryLocale');
    return `${this.definedHomeUrl}?lang=${currentLanguage}`;
  }

  get legalNoticeUrl() {
    const currentLanguage = this.intl.t('current-lang');

    if (this.isFrenchDomainExtension) return 'https://pix.fr/mentions-legales';

    return currentLanguage === 'fr' ? 'https://pix.org/fr/mentions-legales' : 'https://pix.org/en-gb/legal-notice';
  }

  get cguUrl() {
    const currentLanguage = this.intl.t('current-lang');

    if (this.isFrenchDomainExtension) return 'https://pix.fr/conditions-generales-d-utilisation';

    return currentLanguage === 'fr'
      ? 'https://pix.org/fr/conditions-generales-d-utilisation'
      : 'https://pix.org/en-gb/terms-and-conditions';
  }

  get dataProtectionPolicyUrl() {
    const currentLanguage = this.intl.t('current-lang');

    if (this.isFrenchDomainExtension) return 'https://pix.fr/politique-protection-donnees-personnelles-app';

    return currentLanguage === 'fr'
      ? 'https://pix.org/fr/politique-protection-donnees-personnelles-app'
      : 'https://pix.org/en-gb/personal-data-protection-policy';
  }

  get accessibilityUrl() {
    const currentLanguage = this.intl.t('current-lang');

    if (this.isFrenchDomainExtension) return 'https://pix.fr/accessibilite-pix-orga';

    return currentLanguage === 'fr'
      ? 'https://pix.org/fr/accessibilite-pix-orga'
      : 'https://pix.org/en-gb/accessibility-pix-orga';
  }

  get forgottenPasswordUrl() {
    const currentLanguage = this.intl.t('current-lang');
    let url = `${this.pixAppUrlWithoutExtension}${this.currentDomain.getExtension()}/mot-de-passe-oublie`;
    if (currentLanguage === 'en') {
      url += '?lang=en';
    }
    return url;
  }
}
