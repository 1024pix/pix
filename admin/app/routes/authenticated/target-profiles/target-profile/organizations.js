import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class TargetProfileOrganizationsRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    id: { refreshModel: true },
    name: { refreshModel: true },
    type: { refreshModel: true },
    externalId: { refreshModel: true },
  };

  async model(params) {
    const targetProfile = this.modelFor('authenticated.target-profiles.target-profile');
    const queryParams  = {
      targetProfileId: targetProfile.id,
      page: {
        size: params.pageSize,
        number: params.pageNumber,
      },
      filter: {
        id: params.id,
        name: params.name,
        type: params.type,
        externalId: params.externalId,
      },
    };
    const organizations = await this.store.query('organization', queryParams);
    return {
      organizations,
      targetProfile
    };
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 10;
      controller.id = null;
      controller.name = null;
      controller.type = null;
      controller.externalId = null;
      controller.organizationsToAttach = [];
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
