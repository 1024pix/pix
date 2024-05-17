import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ListRoute extends Route {
  @service store;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    id: { refreshModel: true },
    name: { refreshModel: true },
    type: { refreshModel: true },
    externalId: { refreshModel: true },
    hideArchived: { refreshModel: true },
  };

  async model(params) {
    let model;
    try {
      model = await this.store.query('organization', {
        filter: {
          id: params.id ? params.id.trim() : '',
          name: params.name ? params.name.trim() : '',
          type: params.type ? params.type.trim() : '',
          externalId: params.externalId ? params.externalId.trim() : '',
          hideArchived: params.hideArchived,
        },
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
      });
    } catch (error) {
      model = [];
    }
    return model;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 10;
      controller.id = null;
      controller.name = null;
      controller.type = null;
      controller.externalId = null;
      controller.hideArchived = false;
    }
  }
}
