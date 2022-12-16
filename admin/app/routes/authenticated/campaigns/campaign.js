import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class GetRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('campaign', params.campaign_id);
  }
}
