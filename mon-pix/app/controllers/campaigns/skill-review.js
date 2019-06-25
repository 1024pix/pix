import Controller from '@ember/controller';

export default Controller.extend({

  showButtonToShareResult: true,
  displayLoadingButton: false,
  displayErrorMessage: false,

  actions: {
    shareCampaignParticipation() {
      this.set('displayErrorMessage', false);
      this.set('displayLoadingButton', true);
      const campaignParticipation = this.get('model.campaignParticipation');
      campaignParticipation.set('isShared', true);
      campaignParticipation.save()
        .then(function() {
          this.set('showButtonToShareResult', false);
          this.set('displayLoadingButton', false);
        }.bind(this))
        .catch(() => {
          campaignParticipation.rollbackAttributes();
          this.set('displayLoadingButton', false);
          this.set('displayErrorMessage', true);
        });
    },

    hideShareButton() {
      this.set('showButtonToShareResult', false);
    }
  }
});
