import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CampaignsRoute extends Route {
  @service store;

  async model(params) {
    return this.store.queryRecord('campaign', { filter: { code: params.code } });
  }
}
