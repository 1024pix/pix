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
    await targetProfile.hasMany('organizations').reload({ adapterOptions: {
      'page[size]': params.pageSize,
      'page[number]': params.pageNumber,
      'filter[id]': params.id,
      'filter[name]': params.name,
      'filter[type]': params.type,
      'filter[externalId]': params.externalId,
    } });
    return targetProfile;
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
