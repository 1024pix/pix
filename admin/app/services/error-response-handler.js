import every from 'lodash/every';
import isEmpty from 'lodash/isEmpty';

import { inject as service } from '@ember/service';
import Service from '@ember/service';

const ERROR_MESSAGES_BY_STATUS = {
  DEFAULT: 'Une erreur est survenue.',
  STATUS_422: 'Cette opération est impossible.',
  STATUS_412: 'Les préconditions ne sont pas réunies.',
  STATUS_404: 'Non trouvé.',
  STATUS_400: 'Mauvaise requête.',
  STATUS_503: 'Service momentanément indisponible',
};

const ERROR_MESSAGES_BY_CODE = {
  SENDING_EMAIL_TO_INVALID_DOMAIN: "Échec lors de l'envoi d'un e-mail car le domaine semble invalide.",
};

export default class ErrorResponseHandlerService extends Service {
  @service notifications;

  notify(errorResponse, customErrorMessageByStatus) {
    if (!_isJSONAPIError(errorResponse)) {
      this.notifications.error(errorResponse);
      return;
    }

    const { errors } = errorResponse;
    if (!errors) {
      this.notifications.error(ERROR_MESSAGES_BY_STATUS.DEFAULT);
      return;
    }

    errors.forEach((error) => {
      const messageForCode = _getErrorMessageForErrorCode(error.code);
      if (messageForCode) {
        this.notifications.error(messageForCode);
        return;
      }

      const message = _getErrorMessageForHttpStatus(error.status, customErrorMessageByStatus);
      this.notifications.error(message);
    });
  }
}

function _isJSONAPIError(errorResponse) {
  return !isEmpty(errorResponse.errors) && every(errorResponse.errors, (error) => error.title);
}

function _getErrorMessageForErrorCode(errorCode) {
  if (errorCode === 'SENDING_EMAIL_TO_INVALID_DOMAIN') {
    return ERROR_MESSAGES_BY_CODE.SENDING_EMAIL_TO_INVALID_DOMAIN;
  }

  return null;
}

function _getErrorMessageForHttpStatus(errorStatus, customErrorMessageByStatus) {
  switch (errorStatus) {
    case '422':
      return customErrorMessageByStatus?.STATUS_422 || ERROR_MESSAGES_BY_STATUS.STATUS_422;
    case '412':
      return customErrorMessageByStatus?.STATUS_412 || ERROR_MESSAGES_BY_STATUS.STATUS_412;
    case '404':
      return customErrorMessageByStatus?.STATUS_404 || ERROR_MESSAGES_BY_STATUS.STATUS_404;
    case '400':
      return customErrorMessageByStatus?.STATUS_400 || ERROR_MESSAGES_BY_STATUS.STATUS_400;
    case '503':
      return customErrorMessageByStatus?.STATUS_503 || ERROR_MESSAGES_BY_STATUS.STATUS_503;
    default:
      return customErrorMessageByStatus?.DEFAULT || ERROR_MESSAGES_BY_STATUS.DEFAULT;
  }
}
