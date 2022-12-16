import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CampaignLandingPageRoute extends Route {
  @service router;

  beforeModel(transition) {
    if (!transition.from) {
      return this.router.replaceWith('campaigns.entry-point');
    }
  }

  async model() {
    return this.modelFor('campaigns');
  }

  afterModel(campaign) {
    if (campaign.isForAbsoluteNovice) {
      this.router.replaceWith('campaigns.access', campaign.code);
    }
  }
}
