import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CampaignsPresentationStepsRoute extends Route {
  @service store;

  async model() {
    const campaignCode = this.paramsFor('campaigns').code;
    return this.store.queryRecord('campaign-presentation-step', { campaignCode });
  }
}
