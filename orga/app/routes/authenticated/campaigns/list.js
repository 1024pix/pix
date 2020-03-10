import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ListRoute extends Route {
  queryParams = {
    pageNumber: {
      refreshModel: true
    },
    pageSize: {
      refreshModel: true
    },
    name: {
      refreshModel: true
    },
    status: {
      refreshModel: true
    },
    creatorId: {
      refreshModel: true
    },
  };

  @service currentUser;

  model(params) {
    return this.store.query('campaign', {
      filter: {
        organizationId: this.currentUser.organization.id,
        name: params.name,
        status: params.status,
        creatorId: params.creatorId,
      },
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    }, { reload: true });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('pageNumber', 1);
      controller.set('pageSize', 25);
      controller.set('name', null);
      controller.set('creatorId', null);
    }
  }
}
