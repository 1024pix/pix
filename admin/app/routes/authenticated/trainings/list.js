import Route from '@ember/routing/route';
import isEmpty from 'lodash/isEmpty';
import { inject as service } from '@ember/service';

export default class ListRoute extends Route {
  @service accessControl;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    id: { refreshModel: true },
    name: { refreshModel: true },
  };

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  async model(params) {
    let trainingSummaries;
    try {
      trainingSummaries = await this.store.query('training-summary', {
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
}
