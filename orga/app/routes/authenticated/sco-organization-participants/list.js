import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import Route from '@ember/routing/route';

export default class ListRoute extends Route {
  queryParams = {
    search: { refreshModel: true },
    divisions: { refreshModel: true },
    connectionTypes: { refreshModel: true },
    certificability: { refreshModel: true },
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    participationCountOrder: { refreshModel: true },
  };

  @service currentUser;
  @service store;

  model(params) {
    return this.store.query('sco-organization-participant', {
      filter: {
        organizationId: this.currentUser.organization.id,
        search: params.search,
        divisions: params.divisions,
        connectionTypes: params.connectionTypes,
        certificability: params.certificability,
      },
      sort: {
        participationCount: params.participationCountOrder,
      },
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.search = null;
      controller.divisions = [];
      controller.connectionTypes = [];
      controller.certificability = [];
      controller.pageNumber = null;
      controller.pageSize = 50;
      controller.participationCountOrder = null;
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
