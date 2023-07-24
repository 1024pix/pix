import Service, { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

const FRENCH_INTERNATIONAL_LOCALE = 'fr';
const ENGLISH_INTERNATIONAL_LOCALE = 'en';

export default class Url extends Service {
  @service currentDomain;
  @service intl;

  definedHomeUrl = ENV.rootURL;

  get showcase() {
    return { url: this._showcaseWebsiteUrl, linkText: this._showcaseWebsiteLinkText };
  }

  get homeUrl() {
    const currentLanguage = this.intl.t('current-lang');
    return `${this.definedHomeUrl}?lang=${currentLanguage}`;
  }

  get cguUrl() {
    const currentLanguage = this.intl.t('current-lang');
    if (this.currentDomain.isFranceDomain) {
      return `https://pix.fr/conditions-generales-d-utilisation`;
    }
    return currentLanguage === FRENCH_INTERNATIONAL_LOCALE
      ? 'https://pix.org/fr/conditions-generales-d-utilisation'
      : 'https://pix.org/en-gb/terms-and-conditions';
  }

  get dataProtectionPolicyUrl() {
    const currentLanguage = this.intl.t('current-lang');
    if (this.currentDomain.isFranceDomain) {
      return `https://pix.fr/politique-protection-donnees-personnelles-app`;
    }

    return currentLanguage === FRENCH_INTERNATIONAL_LOCALE
      ? 'https://pix.org/fr/politique-protection-donnees-personnelles-app'
      : 'https://pix.org/en-gb/personal-data-protection-policy';
  }

  get _showcaseWebsiteUrl() {
    const currentLanguage = this.intl.t('current-lang');

    if (currentLanguage === ENGLISH_INTERNATIONAL_LOCALE) {
      return `https://pix.${this.currentDomain.getExtension()}/en-gb`;
    }
    return `https://pix.${this.currentDomain.getExtension()}`;
  }

  get _showcaseWebsiteLinkText() {
    return this.intl.t('navigation.showcase-homepage', { tld: this.currentDomain.getExtension() });
  }

  get accessibilityUrl() {
    const currentLanguage = this.intl.t('current-lang');
    if (this.currentDomain.isFranceDomain) {
      return `https://pix.fr/accessibilite`;
    }
    return currentLanguage === FRENCH_INTERNATIONAL_LOCALE
      ? `https://pix.org/fr/accessibilite`
      : `https://pix.org/en-gb/accessibility`;
  }

  get accessibilityHelpUrl() {
    const currentLanguage = this.intl.t('current-lang');
    if (currentLanguage === ENGLISH_INTERNATIONAL_LOCALE) {
      return `https://pix.${this.currentDomain.getExtension()}/en-gb/help-accessibility`;
    }
    return `https://pix.${this.currentDomain.getExtension()}/aide-accessibilite`;
  }

  get supportHomeUrl() {
    const currentLanguage = this.intl.t('current-lang');

    if (currentLanguage === ENGLISH_INTERNATIONAL_LOCALE) {
      return 'https://support.pix.org/en/support/home';
    }
    return 'https://support.pix.org/fr/support/home';
  }

  get levelSevenNewsUrl() {
    const currentLanguage = this.intl.t('current-lang');

    // TODO change these url when they are available
    if (currentLanguage === ENGLISH_INTERNATIONAL_LOCALE) {
      return 'https://pix.org/en/news/european-commission-pix-wins-european-digital-skills-awards';
    }
    return 'https://pix.fr/actualites/commission-europeenne-pix-remporte-european-digital-skills-awards';
  }
}
