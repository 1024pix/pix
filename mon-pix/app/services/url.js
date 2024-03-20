import Service, { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

const FRENCH_INTERNATIONAL_LOCALE = 'fr';
const ENGLISH_INTERNATIONAL_LOCALE = 'en';
const DUTCH_INTERNATIONAL_LOCALE = 'nl';

export default class Url extends Service {
  @service currentDomain;
  @service intl;

  definedHomeUrl = ENV.rootURL;

  get showcase() {
    return { url: this._showcaseWebsiteUrl, linkText: this._showcaseWebsiteLinkText };
  }

  get homeUrl() {
    const currentLanguage = this.intl.primaryLocale;
    return `${this.definedHomeUrl}?lang=${currentLanguage}`;
  }

  get cguUrl() {
    const currentLanguage = this.intl.primaryLocale;

    if (this.currentDomain.isFranceDomain) {
      return `https://pix.fr/conditions-generales-d-utilisation`;
    }

    switch (currentLanguage) {
      case ENGLISH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/en-gb/terms-and-conditions';
      case DUTCH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/nl-be/algemene-gebruiksvoorwaarden';
      default:
        return 'https://pix.org/fr/conditions-generales-d-utilisation';
    }
  }

  get dataProtectionPolicyUrl() {
    const currentLanguage = this.intl.primaryLocale;

    if (this.currentDomain.isFranceDomain) {
      return `https://pix.fr/politique-protection-donnees-personnelles-app`;
    }

    switch (currentLanguage) {
      case ENGLISH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/en-gb/personal-data-protection-policy';
      case DUTCH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/nl-be/beleid-inzake-de-bescherming-van-persoonsgegevens';
      default:
        return 'https://pix.org/fr/politique-protection-donnees-personnelles-app';
    }
  }

  get accessibilityUrl() {
    const currentLanguage = this.intl.primaryLocale;
    if (this.currentDomain.isFranceDomain) {
      return `https://pix.fr/accessibilite`;
    }
    return currentLanguage === FRENCH_INTERNATIONAL_LOCALE
      ? `https://pix.org/fr/accessibilite`
      : `https://pix.org/en-gb/accessibility`;
  }

  get accessibilityHelpUrl() {
    const currentLanguage = this.intl.primaryLocale;
    if (currentLanguage === ENGLISH_INTERNATIONAL_LOCALE) {
      return `https://pix.${this.currentDomain.getExtension()}/en-gb/help-accessibility`;
    }
    return `https://pix.${this.currentDomain.getExtension()}/aide-accessibilite`;
  }

  get supportHomeUrl() {
    const currentLanguage = this.intl.primaryLocale;

    if (currentLanguage === ENGLISH_INTERNATIONAL_LOCALE) {
      return 'https://support.pix.org/en/support/home';
    }
    return 'https://support.pix.org/fr/support/home';
  }

  get levelSevenNewsUrl() {
    const currentLanguage = this.intl.primaryLocale;

    if (currentLanguage === ENGLISH_INTERNATIONAL_LOCALE) {
      return 'https://pix.org/en/news/discover-level-7-on-pix';
    }
    return 'https://pix.fr/actualites/decouvrez-le-niveau-7-des-maintenant-sur-pix';
  }

  get _showcaseWebsiteUrl() {
    const currentLanguage = this.intl.primaryLocale;

    if (currentLanguage === ENGLISH_INTERNATIONAL_LOCALE) {
      return `https://pix.${this.currentDomain.getExtension()}/en-gb`;
    }
    return `https://pix.${this.currentDomain.getExtension()}`;
  }

  get _showcaseWebsiteLinkText() {
    return this.intl.t('navigation.showcase-homepage', { tld: this.currentDomain.getExtension() });
  }
}
