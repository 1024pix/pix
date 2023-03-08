import Service, { inject as service } from '@ember/service';

import ENV from 'pix-orga/config/environment';

const FRENCH_DOMAIN_EXTENSION = 'fr';
const PIX_FR_DOMAIN = 'https://pix.fr';
const PIX_ORG_DOMAIN_FR_LOCALE = 'https://pix.org/fr';
const PIX_ORG_DOMAIN_EN_LOCALE = 'https://pix.org/en-gb';

export default class Url extends Service {
  @service currentDomain;
  @service intl;

  SHOWCASE_WEBSITE_LOCALE_PATH = {
    ACCESSIBILITY: {
      en: '/accessibility-pix-orga',
      fr: '/accessibilite-pix-orga',
    },
    CGU: {
      en: '/terms-and-conditions',
      fr: '/conditions-generales-d-utilisation',
    },
    DATA_PROTECTION_POLICY: {
      en: '/personal-data-protection-policy',
      fr: '/politique-protection-donnees-personnelles-app',
    },
    LEGAL_NOTICE: {
      en: '/legal-notice',
      fr: '/mentions-legales',
    },
  };

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
    const domainExtension = this.currentDomain.getExtension();
    const { en, fr } = this.SHOWCASE_WEBSITE_LOCALE_PATH.LEGAL_NOTICE;

    return this._computeShowcaseWebsiteUrl({ domainExtension, en, fr });
  }

  get cguUrl() {
    const domainExtension = this.currentDomain.getExtension();
    const { en, fr } = this.SHOWCASE_WEBSITE_LOCALE_PATH.CGU;

    return this._computeShowcaseWebsiteUrl({ domainExtension, en, fr });
  }

  get dataProtectionPolicyUrl() {
    const domainExtension = this.currentDomain.getExtension();
    const { en, fr } = this.SHOWCASE_WEBSITE_LOCALE_PATH.DATA_PROTECTION_POLICY;

    return this._computeShowcaseWebsiteUrl({ domainExtension, en, fr });
  }

  get accessibilityUrl() {
    const domainExtension = this.currentDomain.getExtension();
    const { en, fr } = this.SHOWCASE_WEBSITE_LOCALE_PATH.ACCESSIBILITY;

    return this._computeShowcaseWebsiteUrl({ domainExtension, en, fr });
  }

  get forgottenPasswordUrl() {
    const currentLanguage = this.intl.t('current-lang');
    let url = `${this.pixAppUrlWithoutExtension}${this.currentDomain.getExtension()}/mot-de-passe-oublie`;
    if (currentLanguage === 'en') {
      url += '?lang=en';
    }
    return url;
  }

  _computeShowcaseWebsiteUrl({ domainExtension, en: englishPath, fr: frenchPath }) {
    const currentLanguage = this.intl.t('current-lang');

    if (domainExtension === FRENCH_DOMAIN_EXTENSION) {
      return `${PIX_FR_DOMAIN}${frenchPath}`;
    }

    return currentLanguage === FRENCH_DOMAIN_EXTENSION
      ? `${PIX_ORG_DOMAIN_FR_LOCALE}${frenchPath}`
      : `${PIX_ORG_DOMAIN_EN_LOCALE}${englishPath}`;
  }
}
