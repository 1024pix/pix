import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  store: service(),

  campaignCode: null,
  errorMessage: null,

  actions: {

    async startCampaign() {
      this.set('errorMessage', null);

      if (!this.campaignCode) {
        this.set('errorMessage', 'Merci de renseigner le code du parcours.');

      } else {
        const campaignCode = this.campaignCode.toUpperCase();

        const campaignCodeExists = await this.store.query('campaign', { filter: { code: campaignCode } })
          .then(() => true,
            (error) => {
              if (error.errors[0].status === '403') {
                this.set('errorMessage', 'Oups ! nous ne parvenons pas à vous trouver. Verifiez vos informations afin de continuer ou prévenez l’organisateur de votre parcours.');
                return false;
              }
              if (error.errors[0].status === '404') {
                this.set('errorMessage', 'Votre code de parcours est erroné, veuillez vérifier ou contacter la personne organisant le parcours de test.');
                return false;
              }
              throw (error);
            });

        if (campaignCodeExists) {
          return this.transitionToRoute('campaigns.start-or-resume', campaignCode);
        }
      }
    },

    clearErrorMessage() {
      this.set('errorMessage', null);
    }
  }
});
