import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ListRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  @service currentUser;

  async model(params) {
    const organization = this.currentUser.organization;
    await organization.hasMany('memberships').reload({ adapterOptions: {
      'page[size]': params.pageSize,
      'page[number]': params.pageNumber
    } });
    return organization;
  }
}
