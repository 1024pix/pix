import Controller from '@ember/controller';

export default Controller.extend({

  showButtonToShareResult: true,

  actions: {
    shareCampaignParticipation() {
      const campaignParticipation = this.get('model.campaignParticipation');
      campaignParticipation.set('isShared', true);
      campaignParticipation.save()
        .then(function() {
          this.set('showButtonToShareResult', false);
        }.bind(this));

    },
    hideShareButton() {
      this.set('showButtonToShareResult', false);
    }
  }
});
