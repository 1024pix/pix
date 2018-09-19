import Controller from '@ember/controller';

export default Controller.extend({

  showShareButton: true,

  actions: {
    shareCampaignParticipation() {
      const campaignParticipation = this.get('model.campaignParticipation');
      campaignParticipation.set('isShared', true);
      campaignParticipation.save()
        .then(function() {
          this.set('showShareButton', false);
        }.bind(this));

    }
  }
});
