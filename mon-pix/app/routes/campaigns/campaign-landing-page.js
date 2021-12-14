import Route from '@ember/routing/route';

export default class CampaignLandingPageRoute extends Route {
  beforeModel(transition) {
    if (!transition.from) {
      return this.replaceWith('campaigns.entry-point');
    }
  }

  async model() {
    return this.modelFor('campaigns');
  }

  afterModel(campaign) {
    if (campaign.isForAbsoluteNovice) {
      this.replaceWith('campaigns.access', campaign.code);
    }
  }
}
