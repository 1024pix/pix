import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class OrganizationCampaignsRoute extends Route {
  @service store;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  async model(params) {
    const organizationId = this.paramsFor('authenticated.organizations.get').organization_id;

    const query = {
      organizationId,
      'page[number]': params.pageNumber || 1,
      'page[size]': params.pageSize || 10,
    };
    const campaigns = await this.store.query('campaign', query);

    return {
      campaigns,
      organizationId,
    };
  }
}
