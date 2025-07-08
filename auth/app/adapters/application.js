import JSONAPIAdapter from '@ember-data/adapter/json-api';
import ENV from 'auth/config/environment';

export default class ApplicationAdapter extends JSONAPIAdapter {
  host = ENV.APP.API_HOST;
  namespace = 'api';
}
