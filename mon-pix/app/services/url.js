import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

const FRENCH_DOMAIN_EXTENSION = 'fr';

export default class Url extends Service {
  @service currentDomain;
  @service intl;

  definedHomeUrl = ENV.rootURL;

  get isFrenchDomainExtension() {
    return this.currentDomain.getExtension() === FRENCH_DOMAIN_EXTENSION;
  }

  get showcaseUrl() {
    return this._showcaseWebsiteUrl;
  }

  get homeUrl() {
    const currentLanguage = this.intl.t('current-lang');
    return `${this.definedHomeUrl}?lang=${currentLanguage}`;
  }

  get cguUrl() {
    const currentLanguage = this.intl.t('current-lang');
    if (currentLanguage === 'en') {
      return 'https://pix.org/en-gb/terms-and-conditions';
    }
    return `https://pix.${this.currentDomain.getExtension()}/conditions-generales-d-utilisation`;
  }

  get extensionUrl() {
    return this.currentDomain.getExtension();
  }

  get dataProtectionPolicyUrl() {
    const currentLanguage = this.intl.t('current-lang');
    if (currentLanguage === 'en') {
      return 'https://pix.org/en-gb/personal-data-protection-policy';
    }
    return `https://pix.${this.currentDomain.getExtension()}/politique-protection-donnees-personnelles-app`;
  }

  get _showcaseWebsiteUrl() {
    const currentLanguage = this.intl.t('current-lang');

    if (currentLanguage === 'en') {
      return `https://pix.${this.currentDomain.getExtension()}/en-gb`;
    }
    return `https://pix.${this.currentDomain.getExtension()}`;
  }

  get accessibilityUrl() {
    const currentLanguage = this.intl.t('current-lang');

    if (currentLanguage === 'en') {
      return `https://pix.${this.currentDomain.getExtension()}/en-gb/accessibility`;
    }
    return `https://pix.${this.currentDomain.getExtension()}/accessibilite`;
  }

  get accessibilityHelpUrl() {
    const currentLanguage = this.intl.t('current-lang');

    if (currentLanguage === 'en') {
      return `https://pix.${this.currentDomain.getExtension()}/en-gb/help-accessibility`;
    }
    return `https://pix.${this.currentDomain.getExtension()}/aide-accessibilite`;
  }

  get supportHomeUrl() {
    const currentLanguage = this.intl.t('current-lang');

    if (currentLanguage === 'en') {
      return 'https://support.pix.org/en/support/home';
    }
    return 'https://support.pix.org/fr/support/home';
  }
}
