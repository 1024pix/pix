import Route from '@ember/routing/route';

export default class CampaignRoute extends Route {

  async model(params) {
    try {
      const campaign = await this.store.findRecord('campaign', params.campaign_id);
      return campaign;
    } catch (error) {
      this.send('error', error, this.replaceWith('not-found', params.campaign_id));
    }
  }

  redirect(campaign, transition) {
    if (
      transition.from
      && transition.from.name !== 'authenticated.campaigns.new'
      && campaign.isTypeProfilesCollection
    ) {
      this.replaceWith('authenticated.campaigns.campaign.profiles', campaign);
    }
  }
}
