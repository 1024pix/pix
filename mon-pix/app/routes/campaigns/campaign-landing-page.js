import Route from '@ember/routing/route';

export default class CampaignLandingPageRoute extends Route {

  async model() {
    return this.modelFor('campaigns');
  }

  redirect(campaign) {
    if (campaign.isForAbsoluteNovice) {
      return this.replaceWith('campaigns.start-or-resume', campaign);
    }
  }
}
