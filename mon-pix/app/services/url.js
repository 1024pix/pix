import Service, { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

const ENGLISH_INTERNATIONAL_LOCALE = 'en';
const DUTCH_INTERNATIONAL_LOCALE = 'nl';
const SPANISH_INTERNATIONAL_LOCALE = 'es';

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
        return 'https://pix.org/en/terms-and-conditions';
      case DUTCH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/nl-be/algemene-gebruiksvoorwaarden';
      case SPANISH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/en-gb/terms-and-conditions ';
      default:
        return 'https://pix.org/fr/conditions-generales-d-utilisation';
    }
  }

  get legalNoticeUrl() {
    const currentLanguage = this.intl.primaryLocale;

    if (this.currentDomain.isFranceDomain) {
      return `https://pix.fr/mentions-legales`;
    }

    switch (currentLanguage) {
      case ENGLISH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/en/legal-notice';
      case DUTCH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/nl-be/wettelijke-vermeldingen';
      case SPANISH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/en/legal-notice';
      default:
        return 'https://pix.org/fr/mentions-legales';
    }
  }

  get dataProtectionPolicyUrl() {
    const currentLanguage = this.intl.primaryLocale;

    if (this.currentDomain.isFranceDomain) {
      return `https://pix.fr/politique-protection-donnees-personnelles-app`;
    }

    switch (currentLanguage) {
      case ENGLISH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/en/personal-data-protection-policy';
      case DUTCH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/nl-be/beleid-inzake-de-bescherming-van-persoonsgegevens';
      case SPANISH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/en-gb/personal-data-protection-policy';
      default:
        return 'https://pix.org/fr/politique-protection-donnees-personnelles-app';
    }
  }

  get accessibilityUrl() {
    const currentLanguage = this.intl.primaryLocale;

    if (this.currentDomain.isFranceDomain) {
      return `https://pix.fr/accessibilite`;
    }

    switch (currentLanguage) {
      case ENGLISH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/en/accessibility';
      case DUTCH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/nl-be/toegankelijkheid';
      case SPANISH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/en-gb/accessibility';
      default:
        return 'https://pix.org/fr/accessibilite';
    }
  }

  get accessibilityHelpUrl() {
    const currentLanguage = this.intl.primaryLocale;
    if (currentLanguage === ENGLISH_INTERNATIONAL_LOCALE) {
      return `https://pix.${this.currentDomain.getExtension()}/en/help-accessibility`;
    }
    if (currentLanguage === SPANISH_INTERNATIONAL_LOCALE) {
      return `https://pix.${this.currentDomain.getExtension()}/en-gb/help-accessibility`;
    }
    return `https://pix.${this.currentDomain.getExtension()}/aide-accessibilite`;
  }

  get supportHomeUrl() {
    const currentLanguage = this.intl.primaryLocale;

    if (this.currentDomain.isFranceDomain) {
      return 'https://pix.fr/support';
    }

    switch (currentLanguage) {
      case ENGLISH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/en/support';
      case DUTCH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/nl-be/support';
      case SPANISH_INTERNATIONAL_LOCALE:
        return 'https://pix.org/en/support';
      default:
        return 'https://pix.org/fr/support';
    }
  }

  get levelSevenNewsUrl() {
    const currentLanguage = this.intl.primaryLocale;

    if (currentLanguage === ENGLISH_INTERNATIONAL_LOCALE) {
      return 'https://pix.org/en/news/discover-level-7-on-pix';
    }
    return 'https://pix.fr/actualites/decouvrez-le-niveau-7-des-maintenant-sur-pix';
  }

  get serverStatusUrl() {
    const currentLanguage = this.intl.primaryLocale;
    return `https://status.pix.org/?locale=${currentLanguage}`;
  }

  get _showcaseWebsiteUrl() {
    const currentLanguage = this.intl.primaryLocale;

    if (currentLanguage === ENGLISH_INTERNATIONAL_LOCALE) {
      return `https://pix.${this.currentDomain.getExtension()}/en`;
    }
    return `https://pix.${this.currentDomain.getExtension()}`;
  }

  get _showcaseWebsiteLinkText() {
    return this.intl.t('navigation.showcase-homepage', { tld: this.currentDomain.getExtension() });
  }
}
