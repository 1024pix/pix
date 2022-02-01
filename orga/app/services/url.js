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
    if (currentLanguage === 'en') {
      return 'https://pix.org/en-gb/legal-notice';
    }
    return `https://pix.${this.currentDomain.getExtension()}/mentions-legales`;
  }

  get accessibilityUrl() {
    const currentLanguage = this.intl.t('current-lang');
    if (currentLanguage === 'en') {
      return 'https://pix.org/en-gb/accessibility-pix-orga';
    }
    return `https://pix.${this.currentDomain.getExtension()}/accessibilite-pix-orga`;
  }
}
