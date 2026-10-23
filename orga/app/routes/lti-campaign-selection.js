import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class LtiCampaignSelectionRoute extends Route {
  @service store;

  async model() {
    const campaigns = await this.store.findAll('lti-campaign');
    return campaigns;
  }
}
