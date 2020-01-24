import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';

export default Route.extend({
  queryParams: {
    pageNumber: {
      refreshModel: true
    },
    pageSize: {
      refreshModel: true
    }
  },

  currentUser: service(),

  model(params) {
    return this.store.query('campaign', {
      filter: {
        organizationId: this.currentUser.organization.id,
      },
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    });
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('pageNumber', 1);
      controller.set('pageSize', 10);
    }
  }
});
