import Service  from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

const FRENCH_DOMAIN_EXTENSION = 'fr';

export default class Url extends Service {
  @service currentDomain;
  @service intl;

  definedHomeUrl= ENV.rootURL;

  get isFrenchDomainExtension() {
    return this.currentDomain.getExtension() === FRENCH_DOMAIN_EXTENSION;
  }

  get homeUrl() {
    const isProdEnv = ENV.APP.IS_PROD_ENVIRONMENT;

    if (isProdEnv) {
      return this._showcaseWebsiteUrl;
    }
    const currentLanguage = this.intl.t('current-lang');
    return `${this.definedHomeUrl}?lang=${currentLanguage}`;
  }

  get cguUrl() {
    return `https://pix.${this.currentDomain.getExtension()}/conditions-generales-d-utilisation`;
  }

  get _showcaseWebsiteUrl() {
    const currentLanguage = this.intl.t('current-lang');

    if (currentLanguage === 'en') {
      return `https://pix.${this.currentDomain.getExtension()}/en-gb`;
    }
    return `https://pix.${this.currentDomain.getExtension()}`;
  }
}
