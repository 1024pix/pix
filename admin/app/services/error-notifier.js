import { service } from '@ember/service';
import Service from '@ember/service';
import every from 'lodash/every';
import isEmpty from 'lodash/isEmpty';

export default class ErrorNotifierService extends Service {
  @service notifications;

  notify(anError) {
    if (_isJSONAPIError(anError)) {
      anError.errors.forEach((e) => this.notifications.error(new Error(`${e.title} : ${e.detail}`)));
    } else {
      this.notifications.error(anError);
    }
  }
}

function _isJSONAPIError(anError) {
  return !isEmpty(anError.errors) && every(anError.errors, (e) => e.title);
}
