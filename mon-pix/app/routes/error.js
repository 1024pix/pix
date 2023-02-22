import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import get from 'lodash/get';
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

      if (error.shortCode) {
        controller.errorStatus += ` (${error.shortCode})`;
      }
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
