import Route from '@ember/routing/route';
import isEmpty from 'lodash/isEmpty';
import { inject as service } from '@ember/service';

export default class ListRoute extends Route {
  @service accessControl;
  @service notifications;
  @service store;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    id: { refreshModel: true },
    title: { refreshModel: true },
  };

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  async model(params) {
    let trainingSummaries;

    try {
      trainingSummaries = await this.store.query('training-summary', {
        filter: {
          id: params.id ? params.id.trim() : '',
          title: params.title ? params.title.trim() : '',
        },
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
      });
    } catch (errorResponse) {
      if (!isEmpty(errorResponse)) {
        errorResponse.errors.forEach((error) => this.notifications.error(error.detail));
      }
      return [];
    }
    return trainingSummaries;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 10;
      controller.id = null;
      controller.title = null;
    }
  }
}
