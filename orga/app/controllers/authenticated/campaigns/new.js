import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class NewController extends Controller {

  @service store;
  @service notifications;
  @service intl;

  @action
  createCampaign(event) {
    event.preventDefault();
    this.notifications.clearAll();
    return this.model.campaign.save()
      .then((campaign) => this.transitionToRoute('authenticated.campaigns.campaign', campaign.id))
      .catch((errorResponse) => {
        errorResponse.errors.forEach((error) => {
          if (error.status === '500') {
            return this.notifications.sendError(this.intl.t('api-errors.global'));
          }
        });
      });
  }

  @action
  cancel() {
    this.transitionToRoute('authenticated.campaigns');
  }
}
