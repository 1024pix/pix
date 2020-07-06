/* eslint ember/no-actions-hash: 0 */
/* eslint ember/no-classic-classes: 0 */

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
        return this.transitionToRoute('campaigns.start-or-resume', this.model, { queryParams: { participantExternalId } });
      } else {
        return this.set('errorMessage', `Merci de renseigner votre ${ this.model.idPixLabel }.`);
      }
    },

    cancel() {
      this.set('errorMessage', null);

      return this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
        queryParams: { hasUserSeenLandingPage: false }
      });
    },
  }
});
