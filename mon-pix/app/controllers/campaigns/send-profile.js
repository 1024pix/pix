import Controller from '@ember/controller';

export default Controller.extend({

  isLoading: false,
  errorMessage: null,
  pageTitle: 'Envoyer mon profil',

  actions: {

    sendProfile() {
      this.set('errorMessage', null);
      this.set('isLoading', true);

      const campaignParticipation = this.get('model.campaignParticipation');
      campaignParticipation.set('isShared', true);

      return campaignParticipation.save()
        .then(() => {
          this.set('isLoading', false);
        })
        .catch(() => {
          campaignParticipation.rollbackAttributes();
          this.set('isLoading', false);
          this.set('errorMessage', true);
        });
    },
  }
});
