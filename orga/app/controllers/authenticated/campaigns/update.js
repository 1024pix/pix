import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    update(campaign) {
      return campaign.save().then(
        () => this.transitionToRoute('authenticated.campaigns.list')
      );
    },

    cancel() {
      this.transitionToRoute('authenticated.campaigns.list');
    },
  }
});
