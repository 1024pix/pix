import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class ListRoute extends Route.extend(AuthenticatedRouteMixin) {

  queryParams = {
    pageNumber: { refreshModel: true, },
    pageSize: { refreshModel: true, },
    id: { refreshModel: true, },
    name: { refreshModel: true, },
    type: { refreshModel: true, },
    externalId: { refreshModel: true, },
  };

  model(params) {
    return this.store.query('certification-center', {
      filter: {
        id: params.id ? params.id.trim() : '',
        name: params.name ? params.name.trim() : '',
        type: params.type ? params.type.trim() : '',
        externalId: params.externalId ? params.externalId.trim() : '',
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
      controller.pageSize = 10;
      controller.id = null;
      controller.name = null;
      controller.type = null;
      controller.externalId = null;
    }
  }
}
