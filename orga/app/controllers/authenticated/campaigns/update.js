import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    update(campaign) {
      return campaign.save().then(
        (campaign) => this.transitionToRoute('authenticated.campaigns.details', campaign.id)
      );
    },

    cancel() {
      this.transitionToRoute('authenticated.campaigns.list');
    },
  }
});
