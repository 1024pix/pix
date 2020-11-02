import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import isEmpty  from 'lodash/isEmpty';

export default class ListRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service notifications;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    id: { refreshModel: true },
    name: { refreshModel: true },
  };

  async model(params) {
    let targetProfiles;
    try {
      targetProfiles = await this.store.query('target-profile', {
        filter: {
          id: params.id ? params.id.trim() : '',
          name: params.name ? params.name.trim() : '',
        },
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
      });
    } catch (errorResponse) {
      if (!isEmpty(errorResponse)) {
        errorResponse.errors.forEach((error) => this.notifications.error(error.detail));
      }
      return [];
    }
    return targetProfiles;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 10;
      controller.id = null;
      controller.name = null;
    }
  }
}
