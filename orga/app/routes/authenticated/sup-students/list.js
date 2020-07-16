import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import Route from '@ember/routing/route';

export default class ListRoute extends Route {

  queryParams = {
    lastName: { refreshModel: true },
    firstName: { refreshModel: true },
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  @service currentUser;

  model(params) {
    return this.store.query('student', {
      filter: {
        organizationId: this.currentUser.organization.id,
        lastName: params.lastName,
        firstName: params.firstName,
      },
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.lastName = null;
      controller.firstName = null;
      controller.pageNumber = null;
      controller.pageSize = null;
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
