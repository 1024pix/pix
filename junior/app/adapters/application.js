import JSONAPIAdapter from '@ember-data/adapter/json-api';
import ENV from '1d/config/environment';

export default class Application extends JSONAPIAdapter {
  host = ENV.APP.API_HOST;
  namespace = 'api/pix1d';

  get headers() {
    return {
      'X-App-Version': ENV.APP.APP_VERSION,
    };
  }
}
