import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ListRoute extends Route {
  @service store;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    id: { refreshModel: true },
    firstName: { refreshModel: true },
    lastName: { refreshModel: true },
    email: { refreshModel: true },
    username: { refreshModel: true },
  };

  async model(params) {
    if (!params.id && !params.firstName && !params.lastName && !params.email && !params.username) return [];

    try {
      const users = await this.store.query('user', {
        filter: {
          id: params.id ? params.id.replace(/ /g, '') : '',
          firstName: params.firstName ? params.firstName.trim() : '',
          lastName: params.lastName ? params.lastName.trim() : '',
          email: params.email ? params.email.trim() : '',
          username: params.username ? params.username.trim() : '',
        },
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
      });
      return users;
    } catch (error) {
      return [];
    }
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 10;
      controller.id = null;
      controller.firstName = null;
      controller.lastName = null;
      controller.email = null;
      controller.username = null;
    }
  }
}
