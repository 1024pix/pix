import Controller from '@ember/controller';

export default Controller.extend({

  participantExternalId: null,
  loading: false,
  errorMessage: null,

  actions: {

    submit() {
      this.set('model.errorMessage', null);

      const participantExternalId = this.participantExternalId;

      if (participantExternalId) {
        this.set('loading', true);
        return this.start(this.model, participantExternalId);
      } else {
        return this.set('errorMessage', `Merci de renseigner votre ${this.get('model.idPixLabel')}.`);
      }
    },

    cancel() {
      this.set('errorMessage', null);
      
      return this.transitionToRoute('campaigns.campaign-landing-page', this.model.code);
    },
  }
});
