import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CampaignRoute extends Route {
  @service store;
  @service router;

  async model(params) {
    try {
      const campaign = await this.store.findRecord('campaign', params.campaign_id);
      return campaign;
    } catch (error) {
      this.send('error', error, this.router.replaceWith('not-found', params.campaign_id));
    }
  }
}
