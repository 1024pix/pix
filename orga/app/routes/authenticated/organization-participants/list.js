import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ListRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    fullName: { refreshModel: true },
    certificability: { refreshModel: true },
  };

  @service currentUser;
  @service store;

  model(params) {
    return this.store.query('organization-participant', {
      filter: {
        organizationId: this.currentUser.organization.id,
        fullName: params.fullName,
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
      controller.pageNumber = 1;
      controller.pageSize = 25;
      controller.fullName = null;
      controller.certificability = [];
    }
  }
}
