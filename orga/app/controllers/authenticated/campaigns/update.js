import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    async update(campaign) {
      const { id } = await campaign.save();
      this.transitionToRoute('authenticated.campaigns.details', id);
    },

    cancel(campaignId) {
      this.transitionToRoute('authenticated.campaigns.details', campaignId);
    },
  }
});
