import Route from '@ember/routing/route';
import { service } from '@ember/service';
import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';
import { ApplicationError } from 'mon-pix/errors/application-error';
import JSONApiError from 'mon-pix/errors/json-api-error';

export default class ErrorRoute extends Route {
  @service session;
  @service router;

  hasUnauthorizedError(error) {
    const statusCode = get(error, 'errors[0].status');
    return 401 === parseInt(statusCode);
  }

  setupController(controller, error) {
    super.setupController(...arguments);

    controller.errorMessage = error;
    controller.errorDetail = null;
    controller.errorStatus = null;
    controller.errorTitle = null;

    const apiError = get(error, 'errors[0]');

    if (error instanceof JSONApiError) {
      controller.errorMessage = error.message;
      controller.errorStatus = error.status;
      controller.errorTitle = error.title;
      if (error.code === 'USER_INFO_MISSING_FIELDS') {
        const { identityProviderCode, idToken } = error.meta;

        controller.disconnectAndRetryUrl = `${ENV.APP.API_HOST}/api/oidc/unauthenticated-redirect-logout-url?identity_provider=${identityProviderCode}&id_token_hint=${idToken}`;
      }
      if (error.shortCode) {
        controller.errorStatus += ` (${error.shortCode})`;
      }
    } else if (error instanceof ApplicationError) {
      controller.errorMessage = error.message;
    } else if (apiError) {
      controller.errorDetail = apiError.detail;
      controller.errorStatus = apiError.status;
      controller.errorTitle = apiError.title;
    }

    if (this.hasUnauthorizedError(error)) {
      this.router.transitionTo('logout');
    }
  }
}
