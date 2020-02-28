import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class ListRoute extends Route.extend(AuthenticatedRouteMixin) {

  queryParams = {
    pageNumber: { refreshModel: true, },
    pageSize: { refreshModel: true, },
    firstName: { refreshModel: true, },
    lastName: { refreshModel: true, },
    email: { refreshModel: true, },
  };

  model(params) {
    return this.store.query('user', {
      filter: {
        firstName: params.firstName ? params.firstName.trim() : '',
        lastName: params.lastName ? params.lastName.trim() : '',
        email: params.email ? params.email.trim() : '',
      },
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('pageNumber', 1);
      controller.set('pageSize', 10);
      controller.set('firstName', null);
      controller.set('lastName', null);
      controller.set('email', null);
    }
  }
}
