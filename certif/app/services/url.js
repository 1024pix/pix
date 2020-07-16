import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from 'pix-certif/config/environment';

export default class Url extends Service {

  @service currentDomain;

  definedHomeUrl = ENV.APP.HOME_URL;

  get homeUrl() {
    const homeUrl = `https://certif.pix.${this.currentDomain.getExtension()}`;
    return this.definedHomeUrl || homeUrl;
  }

}
