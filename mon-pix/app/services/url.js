import Service  from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from '../config/environment';

const FRENCH_DOMAIN_EXTENSION = 'fr';

export default class Url extends Service {
  @service currentDomain;

  definedHomeUrl= ENV.rootURL;

  get isFrenchDomainExtension() {
    return this.currentDomain.getExtension() === FRENCH_DOMAIN_EXTENSION;
  }

  get homeUrl() {
    const isDevEnvironment = ENV.environment === 'development';
    const isRA = ENV.APP.REVIEW_APP === 'true';

    if (isDevEnvironment || isRA) {
      return this.definedHomeUrl;
    }
    return `https://pix.${this.currentDomain.getExtension()}`;
  }

  get cguUrl() {
    return `https://pix.${this.currentDomain.getExtension()}/conditions-generales-d-utilisation`;
  }
}
