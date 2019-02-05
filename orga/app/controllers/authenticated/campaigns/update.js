import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    update(campaign) {
      return campaign.save().then(
        (campaign) => this.transitionToRoute('authenticated.campaigns.details', campaign.id)
      );
    },

    cancel(campaignId) {
      this.transitionToRoute('authenticated.campaigns.details', campaignId);
    },
  }
});
