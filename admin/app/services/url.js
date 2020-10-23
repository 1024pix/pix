import Service from '@ember/service';
import config from 'pix-admin/config/environment';

export default class Url extends Service {

  definedHomeUrl = config.rootURL;

  get homeUrl() {
    return this.definedHomeUrl;
  }

}
