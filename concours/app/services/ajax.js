import AjaxService from 'ember-ajax/services/ajax';
import config from '../config/environment';

export default AjaxService.extend({
  host: config.APP.API_HOST,
  contentType: 'application/json; charset=utf-8'
});
