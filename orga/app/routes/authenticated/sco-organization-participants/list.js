import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import Route from '@ember/routing/route';

export default class ListRoute extends Route {
  queryParams = {
    lastName: { refreshModel: true },
    firstName: { refreshModel: true },
    search: { refreshModel: true },
    divisions: { refreshModel: true },
    connexionType: { refreshModel: true },
    certificability: { refreshModel: true },
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  @service currentUser;

  model(params) {
    return this.store.query('sco-organization-participant', {
      filter: {
        organizationId: this.currentUser.organization.id,
        lastName: params.lastName,
        firstName: params.firstName,
        search: params.search,
        divisions: params.divisions,
        connexionType: params.connexionType,
        certificability: params.certificability,
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
      controller.search = null;
      controller.divisions = [];
      controller.connexionType = null;
      controller.certificability = null;
      controller.pageNumber = null;
      controller.pageSize = null;
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
