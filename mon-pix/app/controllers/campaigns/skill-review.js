import Controller from '@ember/controller';

export default Controller.extend({

  displayLoadingButton: false,
  displayErrorMessage: false,

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

    async improvmentCampaignParticipationResult() {
      const assessment = this.get('model.assessment');
      await assessment.save({ adapterOptions: { improvmentCampaignParticipationResult: true } });
      return this.transitionToRoute('assessments.resume', assessment.get('id'));
    },
  }
});
