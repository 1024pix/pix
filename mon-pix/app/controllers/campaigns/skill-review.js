import Controller from '@ember/controller';

export default Controller.extend({

  displayLoadingButton: false,
  displayErrorMessage: false,
  displayImprovementButton: false,

  actions: {
    shareCampaignParticipation() {
      this.set('displayErrorMessage', false);
      this.set('displayLoadingButton', true);
      const campaignParticipation = this.get('model.campaignParticipation');
      campaignParticipation.set('isShared', true);
      return campaignParticipation.save()
        .then(() => {
          this.set('displayLoadingButton', false);
        })
        .catch(() => {
          campaignParticipation.rollbackAttributes();
          this.set('displayLoadingButton', false);
          this.set('displayErrorMessage', true);
        });
    },

    async improvementCampaignParticipation() {
      const assessment = this.get('model.assessment');
      const campaignParticipation = this.get('model.campaignParticipation');
      await campaignParticipation.save({ adapterOptions: { startImprovement: true } });
      return this.transitionToRoute('campaigns.start-or-resume', assessment.get('codeCampaign'));
    },

  }
});
