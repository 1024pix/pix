import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CampaignRoute extends Route {
  @service store;
  @service router;

  async model(params) {
    try {
      return await this.store.findRecord('campaign', params.campaign_id);
    } catch {
      this.router.replaceWith('not-found', params.campaign_id);
    }
  }
}
