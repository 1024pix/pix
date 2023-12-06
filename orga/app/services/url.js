import Service, { inject as service } from '@ember/service';

import ENV from 'pix-orga/config/environment';

const FRENCH_LOCALE = 'fr';
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

  get campaignsRootUrl() {
    return this.definedCampaignsRootUrl
      ? this.definedCampaignsRootUrl
      : `${this.pixAppUrlWithoutExtension}${this.currentDomain.getExtension()}/campagnes/`;
  }

  get homeUrl() {
    const currentLanguage = this.intl.primaryLocale;
    return `${this.definedHomeUrl}?lang=${currentLanguage}`;
  }

  get legalNoticeUrl() {
    const { en, fr } = this.SHOWCASE_WEBSITE_LOCALE_PATH.LEGAL_NOTICE;
    return this._computeShowcaseWebsiteUrl({ en, fr });
  }

  get cguUrl() {
    const { en, fr } = this.SHOWCASE_WEBSITE_LOCALE_PATH.CGU;
    return this._computeShowcaseWebsiteUrl({ en, fr });
  }

  get dataProtectionPolicyUrl() {
    const { en, fr } = this.SHOWCASE_WEBSITE_LOCALE_PATH.DATA_PROTECTION_POLICY;
    return this._computeShowcaseWebsiteUrl({ en, fr });
  }

  get accessibilityUrl() {
    const { en, fr } = this.SHOWCASE_WEBSITE_LOCALE_PATH.ACCESSIBILITY;
    return this._computeShowcaseWebsiteUrl({ en, fr });
  }

  get forgottenPasswordUrl() {
    const currentLanguage = this.intl.primaryLocale;
    let url = `${this.pixAppUrlWithoutExtension}${this.currentDomain.getExtension()}/mot-de-passe-oublie`;
    if (currentLanguage === 'en') {
      url += '?lang=en';
    }
    return url;
  }

  _computeShowcaseWebsiteUrl({ en: englishPath, fr: frenchPath }) {
    const currentLanguage = this.intl.primaryLocale;

    if (this.currentDomain.isFranceDomain) {
      return `${PIX_FR_DOMAIN}${frenchPath}`;
    }

    return currentLanguage === FRENCH_LOCALE
      ? `${PIX_ORG_DOMAIN_FR_LOCALE}${frenchPath}`
      : `${PIX_ORG_DOMAIN_EN_LOCALE}${englishPath}`;
  }
}
