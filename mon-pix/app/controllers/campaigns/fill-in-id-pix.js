import Controller from '@ember/controller';

export default Controller.extend({

  actions: {

    submit() {
      this.set('model.errorMessage', null);

      const participantExternalId = this.get('model.participantExternalId');
      if (participantExternalId) {
        this.set('model.loading', true);
        return this.get('start')(this.get('model.campaignCode'), participantExternalId);
      } else {
        return this.set('model.errorMessage', `Merci de renseigner votre ${this.get('model.idPixLabel')}.`);
      }
    },

    cancel() {
      this.set('model.errorMessage', null);
      return this.transitionToRoute('campaigns.campaign-landing-page', this.get('model.campaignCode'));
    },
  }
});
