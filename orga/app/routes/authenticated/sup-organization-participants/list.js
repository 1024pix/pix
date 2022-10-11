import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import Route from '@ember/routing/route';

export default class ListRoute extends Route {
  queryParams = {
    lastName: { refreshModel: true },
    firstName: { refreshModel: true },
    studentNumber: { refreshModel: true },
    groups: { refreshModel: true },
    certificability: { refreshModel: true },
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  @service currentUser;
  @service store;

  async model(params) {
    const organizationId = this.currentUser.organization.id;
    return this.store.query('sup-organization-participant', {
      filter: {
        organizationId,
        lastName: params.lastName,
        firstName: params.firstName,
        studentNumber: params.studentNumber,
        groups: params.groups,
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
      controller.studentNumber = null;
      controller.groups = [];
      controller.certificability = [];
      controller.pageNumber = null;
      controller.pageSize = null;
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
