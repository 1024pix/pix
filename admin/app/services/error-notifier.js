import Service from '@ember/service';
import { service } from '@ember/service';
import every from 'lodash/every';
import isEmpty from 'lodash/isEmpty';

export default class ErrorNotifierService extends Service {
  @service pixToast;

  notify(anError) {
    if (_isJSONAPIError(anError)) {
      anError.errors.forEach((e) =>
        this.pixToast.sendErrorNotification({ message: new Error(`${e.title} : ${e.detail}`) }),
      );
    } else {
      this.pixToast.sendErrorNotification({ message: anError });
    }
  }
}

function _isJSONAPIError(anError) {
  return !isEmpty(anError.errors) && every(anError.errors, (e) => e.title);
}
