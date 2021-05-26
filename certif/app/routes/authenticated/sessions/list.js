import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ListRoute extends Route {

  queryParams = {
    pageNumber: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
  };

  @service currentUser;

  model(params) {
    return this.store.query('session-summary', {
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    }, { reload: true });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 25;
    }
  }
}
