import Service, { service } from '@ember/service';
import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';

const DEFAULT_MESSAGE = { i18nKey: 'common.error' };

const HTTP_STATUS_MAPPING = {
  400: { i18nKey: ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY },
  401: { i18nKey: ENV.APP.API_ERROR_MESSAGES.LOGIN_UNAUTHORIZED.I18N_KEY },
  409: { i18nKey: 'pages.oidc-signup-or-login.error.account-conflict' },
  422: { i18nKey: ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY },
  504: { i18nKey: ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.I18N_KEY },
};

const AUTHENTICATION_ERROR_CODES_MAPPING = {
  EXPIRED_AUTHENTICATION_KEY: {
    i18nKey: 'pages.oidc-signup-or-login.error.expired-authentication-key',
  },
  PASSWORD_RESET_TOKEN_INVALID_OR_EXPIRED: {
    i18nKey: 'pages.oidc-signup-or-login.error.password-reset-token-invalid-or-expired',
  },
  USER_IS_TEMPORARY_BLOCKED: {
    getI18nKey: (error) => {
      if (error.meta?.isLoginFailureWithUsername) {
        return ENV.APP.API_ERROR_MESSAGES.USER_IS_TEMPORARY_BLOCKED_WITH_USERNAME.I18N_KEY;
      }
      return ENV.APP.API_ERROR_MESSAGES.USER_IS_TEMPORARY_BLOCKED.I18N_KEY;
    },
    getOptions: (error) => ({
      url: '/mot-de-passe-oublie',
      blockingDurationMinutes: error.meta?.blockingDurationMs / 1000 / 60,
      htmlSafe: true,
    }),
  },
  USER_IS_BLOCKED: {
    i18nKey: ENV.APP.API_ERROR_MESSAGES.USER_IS_BLOCKED.I18N_KEY,
    getOptions: (_error) => ({
      url: 'https://support.pix.org/support/tickets/new',
      htmlSafe: true,
    }),
  },
  MISSING_OR_INVALID_CREDENTIALS: {
    getI18nKey: (error) => {
      if (error.meta?.isLoginFailureWithUsername) {
        if (error.meta?.remainingAttempts > 0) {
          return ENV.APP.API_ERROR_MESSAGES.MISSING_OR_INVALID_CREDENTIALS_REMAINING_ATTEMPTS_WITH_USERNAME.I18N_KEY;
        }
        return ENV.APP.API_ERROR_MESSAGES.MISSING_OR_INVALID_CREDENTIALS_WITH_USERNAME.I18N_KEY;
      }

      if (error.meta?.remainingAttempts > 0) {
        return ENV.APP.API_ERROR_MESSAGES.MISSING_OR_INVALID_CREDENTIALS_REMAINING_ATTEMPTS.I18N_KEY;
      }
      return ENV.APP.API_ERROR_MESSAGES.MISSING_OR_INVALID_CREDENTIALS.I18N_KEY;
    },
    getOptions: (error) => ({ remainingAttempts: error.meta?.remainingAttempts, htmlSafe: true }),
  },
};

const AUTHENTICATION_DEFAULT_MESSAGE = {
  i18nKey: 'common.api-error-messages.login-unexpected-error',
  getOptions: (_error, { url }) => ({ supportHomeUrl: url.supportHomeUrl, htmlSafe: true }),
};

export default class ErrorMessagesService extends Service {
  @service intl;
  @service url;

  getHttpErrorMessage(originalError, defaultMessage = DEFAULT_MESSAGE) {
    const error = get(originalError, 'errors[0]') || originalError;

    const message = HTTP_STATUS_MAPPING[error?.status];

    return this.#formatError(error, message || defaultMessage);
  }

  getAuthenticationErrorMessage(originalError) {
    const error = get(originalError, 'errors[0]') || originalError;
    const message = AUTHENTICATION_ERROR_CODES_MAPPING[error?.code];
    if (!message) {
      return this.getHttpErrorMessage(originalError, AUTHENTICATION_DEFAULT_MESSAGE);
    }

    return this.#formatError(error, message);
  }

  #formatError(error, message) {
    const { i18nKey, getI18nKey, getOptions } = message;
    const options = getOptions ? getOptions(error, { url: this.url }) : {};

    if (getI18nKey) {
      return this.intl.t(getI18nKey(error), options);
    }

    return this.intl.t(i18nKey, options);
  }
}
