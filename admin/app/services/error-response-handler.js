import every from 'lodash/every';
import isEmpty from 'lodash/isEmpty';

import { inject as service } from '@ember/service';
import Service from '@ember/service';

export default class ErrorResponseHandlerService extends Service {
  @service notifications;

  ERROR_MESSAGES_BY_STATUS = {
    DEFAULT: 'Une erreur est survenue.',
    STATUS_422: 'Cette opération est impossible.',
    STATUS_412: 'Les préconditions ne sont pas réunies.',
    STATUS_404: 'Non trouvé.',
    STATUS_400: 'Mauvaise requête.',
  };

  notify(errorResponse, customErrorMessageByStatus) {
    if (!_isJSONAPIError(errorResponse)) {
      return this.notifications.error(errorResponse);
    }

    const { errors } = errorResponse;
    if (!errors) {
      return this.notifications.error(this.ERROR_MESSAGES_BY_STATUS.DEFAULT);
    }

    errors.map((error) => {
      switch (error.status) {
        case '422':
          this.notifications.error(customErrorMessageByStatus?.STATUS_422 || this.ERROR_MESSAGES_BY_STATUS.STATUS_422);
          break;
        case '412':
          this.notifications.error(customErrorMessageByStatus?.STATUS_412 || this.ERROR_MESSAGES_BY_STATUS.STATUS_412);
          break;
        case '404':
          this.notifications.error(customErrorMessageByStatus?.STATUS_404 || this.ERROR_MESSAGES_BY_STATUS.STATUS_404);
          break;
        case '400':
          this.notifications.error(customErrorMessageByStatus?.STATUS_400 || this.ERROR_MESSAGES_BY_STATUS.STATUS_400);
          break;
        default:
          this.notifications.error(customErrorMessageByStatus?.DEFAULT || this.ERROR_MESSAGES_BY_STATUS.DEFAULT);
          break;
      }
    });
  }
}

function _isJSONAPIError(errorResponse) {
  return !isEmpty(errorResponse.errors) && every(errorResponse.errors, (error) => error.title);
}
