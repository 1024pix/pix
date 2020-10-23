import Service from '@ember/service';

import config from 'pix-certif/config/environment';

export default class Url extends Service {

  definedHomeUrl = config.rootURL;

  get homeUrl() {
    return this.definedHomeUrl;
  }

}
