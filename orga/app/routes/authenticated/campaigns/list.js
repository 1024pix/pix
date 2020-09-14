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
    name: {
      refreshModel: true,
    },
    status: {
      refreshModel: true,
    },
    creatorName: {
      refreshModel: true,
    },
  };

  @service currentUser;

  model(params) {
    return this.store.query('campaign', {
      filter: {
        organizationId: this.currentUser.organization.id,
        name: params.name,
        status: params.status,
        creatorName: params.creatorName,
      },
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
      controller.name = null;
      controller.creatorName = null;
    }
  }
}
