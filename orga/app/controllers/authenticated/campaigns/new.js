import Controller from '@ember/controller';
import { inject } from '@ember/service';

export default Controller.extend({

  store: inject(),
  error500Message: null,

  actions: {
    createCampaign(campaign) {
      return campaign.save()
        .then((campaign) => this.transitionToRoute('authenticated.campaigns.details', campaign.id))
        .catch((errorResponse) => {
          errorResponse.errors.forEach((error) => {
            if (error.status === '500') {
              return this.set('error500Message', error.title);
            }
          });
        });
    },

    cancel() {
      this.transitionToRoute('authenticated.campaigns');
    },
  }
});
