import Service  from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from '../config/environment';

const FRENCH_DOMAIN_EXTENSION = 'fr';

export default class Url extends Service {
  @service currentDomain;
  definedHomeUrl = ENV.APP.HOME_URL;

  get isFrenchDomainExtension() {
    return this.currentDomain.getExtension() === FRENCH_DOMAIN_EXTENSION;
  }

  get homeUrl() {
    const homeUrl = `https://pix.${this.currentDomain.getExtension()}`;
    return this.definedHomeUrl || homeUrl;
  }
}
