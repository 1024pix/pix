import Route from '@ember/routing/route';

export default class OrganizationCampaignsRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  }

  async model(params) {
    const organizationId = this.paramsFor('authenticated.organizations.get').organization_id;

    const query = {
      organizationId,
      'page[number]': params.pageNumber || 1,
      'page[size]': params.pageSize || 10,
    };
    return this.store.query('campaign', query);
  }
}
