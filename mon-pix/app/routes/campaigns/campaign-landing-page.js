import Route from '@ember/routing/route';

export default class CampaignLandingPageRoute extends Route {
  async model() {
    return this.modelFor('campaigns');
  }

  afterModel(campaign) {
    if (campaign.isForAbsoluteNovice) {
      this.replaceWith('campaigns.access', campaign.code);
    }
  }
}
