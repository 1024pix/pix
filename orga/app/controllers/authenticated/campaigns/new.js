import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  store: service(),
  notifications: service('notifications'),

  actions: {
    createCampaign(campaign) {
      this.get('notifications').clearAll();
      return campaign.save()
        .then((campaign) => this.transitionToRoute('authenticated.campaigns.details', campaign.id))
        .catch((errorResponse) => {
          errorResponse.errors.forEach((error) => {
            if (error.status === '500') {
              return this.get('notifications').sendError(error.title);
            }
          });
        });
    },

    cancel() {
      this.transitionToRoute('authenticated.campaigns');
    },
  }
});
