import Controller from '@ember/controller';

export default Controller.extend({

  actions: {
    startCampaignParticipation() {
      return this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
        queryParams: { hasSeenLanding: true }
      });
    }
  }
});
