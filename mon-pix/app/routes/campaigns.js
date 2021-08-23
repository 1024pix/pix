import Route from '@ember/routing/route';

export default class CampaignsRoute extends Route {
  model(params) {
    return this.store.queryRecord('campaign', { filter: { code: params.code } });
  }
}
