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
    const isDevEnvironment = ENV.environment === 'development';
    const isRA = ENV.APP.REVIEW_APP === 'true';

    if (isDevEnvironment || isRA) {
      const currentLanguage = this.intl.t('current-lang');
      return `${this.definedHomeUrl}?lang=${currentLanguage}`;
    }
    return `https://pix.${this.currentDomain.getExtension()}`;
  }

  get cguUrl() {
    return `https://pix.${this.currentDomain.getExtension()}/conditions-generales-d-utilisation`;
  }
}
