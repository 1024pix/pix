import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  store: service(),

  campaignCode: null,
  errorMessage: null,

  actions: {

    async startCampaign() {
      this.set('errorMessage', null);

      if (!this.get('campaignCode')) {
        this.set('errorMessage', 'Merci de renseigner le code du parcours.');

      } else {
        const campaignCode = this.get('campaignCode').toUpperCase();

        const campaignCodeExists = await this.store.query('campaign', { filter: { code: campaignCode } })
          .then(() => true,
            (error) => {
              if (error.errors[0].status === '404') {
                return false;
              } else {
                throw (error);
              }
            });

        if (campaignCodeExists) {
          return this.transitionToRoute('campaigns.start-or-resume', campaignCode);
        } else {
          this.set('errorMessage', 'Votre code de parcours est erroné, veuillez vérifier ou contacter la personne organisant le parcours de test.');
        }
      }
    },

    clearErrorMessage() {
      this.set('errorMessage', null);
    }
  }
});
