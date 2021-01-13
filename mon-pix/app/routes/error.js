import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import get from 'lodash/get';

export default class ErrorRoute extends Route {
  @service session;

  hasUnauthorizedError(error) {
    const statusCode = get(error, 'errors[0].code');
    return statusCode === 401;
  }

  setupController(controller, error) {
    super.setupController(...arguments);
    controller.errorMessage = error;

    if (error.errors && error.errors[0]) {
      const apiError = error.errors[0];
      controller.errorDetail = apiError.detail;
      controller.errorStatus = apiError.status;
      controller.errorTitle = apiError.title;
    } else {
      controller.errorDetail = null;
      controller.errorStatus = null;
      controller.errorTitle = null;
    }

    if (this.hasUnauthorizedError(error)) {
      return this.transitionTo('logout');
    }
  }
}
