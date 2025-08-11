// This file is a COPY of an original file from mon-pix.
// If you need a change, modify the original file and
// propagate the changes in the copies in all the fronts.

import Service, { service } from '@ember/service';
import ENV from 'pix-certif/config/environment';

const { DEFAULT_LOCALE } = ENV.APP;

// Don't use directly this service, use a url service which extends it
export default class UrlBaseService extends Service {
  @service currentDomain;
  @service locale;

  get homeUrl() {
    const currentLocale = this.locale.currentLocale;
    return `${ENV.rootURL}?lang=${currentLocale}`;
  }

  get serverStatusUrl() {
    return `https://status.pix.org/?locale=${this.locale.currentLanguage}`;
  }

  get pixAppUrl() {
    if (!ENV.APP.PIX_APP_URL_WITHOUT_EXTENSION) return ENV.rootURL;
    const tld = this.currentDomain.getExtension();
    return `${ENV.APP.PIX_APP_URL_WITHOUT_EXTENSION}${tld}`;
  }

  get pixAppForgottenPasswordUrl() {
    const url = `${this.pixAppUrl}/mot-de-passe-oublie`;
    const currentLocale = this.locale.currentLocale;
    return currentLocale === 'fr' ? url : `${url}?lang=${currentLocale}`;
  }

  getPixWebsiteUrl(pathname = '') {
    const locale = this.currentDomain.isFranceDomain ? 'fr-FR' : this.locale.currentLocale;
    const rootUrl = PIX_WEBSITE_ROOT_URLS[locale] || PIX_WEBSITE_ROOT_URLS[DEFAULT_LOCALE];
    return pathname ? `${rootUrl}/${pathname}` : rootUrl;
  }

  getPixWebsiteUrlFor(pathKey) {
    const locale = this.currentDomain.isFranceDomain ? 'fr-FR' : this.locale.currentLocale;
    const pathsByLocale = PIX_WEBSITE_PATHS[pathKey] || {};
    const pathname = pathsByLocale[locale] || pathsByLocale[DEFAULT_LOCALE];
    return this.getPixWebsiteUrl(pathname);
  }
}

// Pix website URLs for each supported locales
export const PIX_WEBSITE_ROOT_URLS = {
  'fr-FR': 'https://pix.fr',
  'fr-BE': 'https://pix.org/fr-be',
  'nl-BE': 'https://pix.org/nl-be',
  nl: 'https://pix.org/nl-be',
  en: 'https://pix.org/en',
  es: 'https://pix.org/en',
  fr: 'https://pix.org/fr',
};

// Pix website paths for each supported locales
export const PIX_WEBSITE_PATHS = {
  CGU: {
    'fr-FR': 'conditions-generales-d-utilisation',
    'fr-BE': 'conditions-generales-d-utilisation',
    'nl-BE': 'algemene-gebruiksvoorwaarden',
    nl: 'algemene-gebruiksvoorwaarden',
    en: 'terms-and-conditions',
    es: 'terms-and-conditions',
    fr: 'conditions-generales-d-utilisation',
  },
  LEGAL_NOTICE: {
    'fr-FR': 'mentions-legales',
    'fr-BE': 'mentions-legales',
    'nl-BE': 'wettelijke-vermeldingen',
    nl: 'wettelijke-vermeldingen',
    en: 'legal-notice',
    es: 'legal-notice',
    fr: 'mentions-legales',
  },
  DATA_PROTECTION_POLICY: {
    'fr-FR': 'politique-protection-donnees-personnelles-app',
    'fr-BE': 'politique-protection-donnees-personnelles-app',
    'nl-BE': 'beleid-inzake-de-bescherming-van-persoonsgegevens',
    nl: 'beleid-inzake-de-bescherming-van-persoonsgegevens',
    en: 'personal-data-protection-policy',
    es: 'personal-data-protection-policy',
    fr: 'politique-protection-donnees-personnelles-app',
  },
  ACCESSIBILITY: {
    'fr-FR': 'accessibilite',
    'fr-BE': 'accessibilite',
    'nl-BE': 'toegankelijkheid',
    nl: 'toegankelijkheid',
    en: 'accessibility',
    es: 'accessibility',
    fr: 'accessibilite',
  },
  ACCESSIBILITY_ORGA: {
    'fr-FR': 'accessibilite-pix-orga',
    'fr-BE': 'accessibilite-pix-orga',
    'nl-BE': 'toegankelijkheid-pix-orga',
    nl: 'toegankelijkheid-pix-orga',
    en: 'accessibility-pix-orga',
    es: 'accessibility-pix-orga',
    fr: 'accessibilite-pix-orga',
  },
  ACCESSIBILITY_CERTIF: {
    'fr-FR': 'accessibilite-pix-certif',
    'fr-BE': 'accessibilite-pix-certif',
    'nl-BE': 'toegankelijkheid-pix-certif',
    nl: 'toegankelijkheid-pix-certif',
    en: 'accessibility-pix-certif',
    es: 'accessibility-pix-certif',
    fr: 'accessibilite-pix-certif',
  },
  SUPPORT: {
    'fr-FR': 'support',
    'fr-BE': 'support',
    'nl-BE': 'support',
    nl: 'support',
    en: 'support',
    es: 'support',
    fr: 'support',
  },
  CERTIFICATION_RESULTS_EXPLANATION: {
    'fr-FR': 'certification-comprendre-score-niveau',
    'fr-BE': 'certification-comprendre-score-niveau',
    'nl-BE': 'mijn-certificeringsresultaten-begrijpen',
    nl: 'mijn-certificeringsresultaten-begrijpen',
    en: 'understand-certification-results',
    es: 'understand-certification-results',
    fr: 'certification-comprendre-score-niveau',
  },
};
