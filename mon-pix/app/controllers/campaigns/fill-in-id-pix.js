import Controller from '@ember/controller';

export default Controller.extend({

  participantExternalId: null,
  isLoading: false,
  errorMessage: null,
  pageTitle: 'Saisir mon identifiant',

  actions: {

    submit() {
      this.set('model.errorMessage', null);

      const participantExternalId = this.participantExternalId;

      if (participantExternalId) {
        this.set('isLoading', true);
        return this.start(this.model, participantExternalId);
      } else {
        return this.set('errorMessage', `Merci de renseigner votre ${ this.model.idPixLabel }.`);
      }
    },

    cancel() {
      this.set('errorMessage', null);

      return this.transitionToRoute('campaigns.campaign-landing-page', this.model.code);
    },
  }
});
