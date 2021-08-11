import Route from '@ember/routing/route';

export default class GetRoute extends Route {
  model(params) {
    return this.store.findRecord('campaign', params.campaign_id);
  }
}
