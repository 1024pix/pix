import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import Route from '@ember/routing/route';

export default class ListRoute extends Route {

  queryParams = {
    lastName: {
      refreshModel: true
    },
  };

  @service currentUser;

  model(params) {
    return this.store.query('student', {
      filter: {
        organizationId: this.currentUser.organization.id,
        lastName: params.lastName,
      },
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('lastName', null);
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
