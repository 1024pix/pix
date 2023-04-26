import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

const FRANCE_TLD = 'fr';
const FRENCH_INTERNATIONAL_LOCALE = 'fr';
const ENGLISH_INTERNATIONAL_LOCALE = 'en';

export default class Url extends Service {
  @service currentDomain;
  @service intl;

  definedHomeUrl = ENV.rootURL;

  get isFrenchDomainExtension() {
    return this.currentDomain.getExtension() === FRANCE_TLD;
  }

  get showcase() {
    return { url: this._showcaseWebsiteUrl, linkText: this._showcaseWebsiteLinkText };
  }

  get homeUrl() {
    const currentLanguage = this.intl.t('current-lang');
    return `${this.definedHomeUrl}?lang=${currentLanguage}`;
  }

  get cguUrl() {
    const tld = this.currentDomain.getExtension();
    const currentLanguage = this.intl.t('current-lang');
    if (tld === FRANCE_TLD) {
      return `https://pix.fr/conditions-generales-d-utilisation`;
    }
    return currentLanguage === FRENCH_INTERNATIONAL_LOCALE
      ? 'https://pix.org/fr/conditions-generales-d-utilisation'
      : 'https://pix.org/en-gb/terms-and-conditions';
  }

  get dataProtectionPolicyUrl() {
    const tld = this.currentDomain.getExtension();
    const currentLanguage = this.intl.t('current-lang');
    if (tld === FRANCE_TLD) {
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
    const tld = this.currentDomain.getExtension();
    const currentLanguage = this.intl.t('current-lang');

    if (tld === FRANCE_TLD) {
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
}
