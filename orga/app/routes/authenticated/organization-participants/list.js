import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ListRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    fullName: { refreshModel: true },
  };

  @service currentUser;

  model(params) {
    return this.store.query('organization-participant', {
      filter: {
        organizationId: this.currentUser.organization.id,
        fullName: params.fullName,
      },
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    });
  }

  resetController(controller) {
    controller.pageNumber = 1;
    controller.pageSize = 25;
    controller.fullName = null;
  }
}
