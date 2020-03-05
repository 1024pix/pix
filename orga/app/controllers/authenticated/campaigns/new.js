import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class NewController extends Controller {
  @service store;

  @service notifications;

  @action
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
  }

  @action
  cancel() {
    this.transitionToRoute('authenticated.campaigns');
  }
}
