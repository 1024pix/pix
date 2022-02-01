import Route from '@ember/routing/route';

export default class CampaignsRoute extends Route {
  async model(params) {
    return this.store.queryRecord('campaign', { filter: { code: params.code } });
  }
}
