import Service, { inject as service } from '@ember/service';

import config from 'pix-certif/config/environment';

export default class Url extends Service {
  definedHomeUrl = config.rootURL;

  @service currentDomain;
  @service intl;

  get homeUrl() {
    return this.definedHomeUrl;
  }

  get cguUrl() {
    const currentLanguage = this.intl.t('current-lang');
    if (currentLanguage === 'en') return 'https://pix.org/en-gb/terms-and-conditions';
    return `https://pix.${this.currentDomain.getExtension()}/conditions-generales-d-utilisation`;
  }

  get dataProtectionPolicyUrl() {
    const currentLanguage = this.intl.t('current-lang');
    if (currentLanguage === 'en') return 'https://pix.org/en-gb/personal-data-protection-policy';
    return `https://pix.${this.currentDomain.getExtension()}/politique-protection-donnees-personnelles-app`;
  }
}
