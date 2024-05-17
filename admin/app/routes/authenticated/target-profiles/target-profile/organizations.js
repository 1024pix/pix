import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class TargetProfileOrganizationsRoute extends Route {
  @service store;
  @service accessControl;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    id: { refreshModel: true },
    name: { refreshModel: true },
    type: { refreshModel: true },
    externalId: { refreshModel: true },
  };

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  async model(params) {
    let organizations;
    const targetProfile = this.modelFor('authenticated.target-profiles.target-profile');
    const queryParams = {
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
    try {
      organizations = await this.store.query('organization', queryParams);
    } catch (e) {
      organizations = [];
    }

    return {
      organizations,
      targetProfile,
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
    }
  }
}
