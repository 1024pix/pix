import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class NewController extends Controller {
  @service router;
  @service store;
  @service notifications;
  @service intl;

  @tracked errors;

  @action
  async createCampaign(campaignAttributes) {
    this.notifications.clearAll();
    this.errors = null;

    try {
      this.model.campaign.setProperties(campaignAttributes);
      await this.model.campaign.save();
    } catch (errorResponse) {
      errorResponse.errors.forEach((error) => {
        if (error.status === '500') {
          this.notifications.sendError(this.intl.t('api-error-messages.global'));
        }
      });
      this.errors = this.model.campaign.errors;
    }

    if (!this.errors) {
      this.router.transitionTo('authenticated.campaigns.campaign.settings', this.model.campaign.id);
    }
  }

  @action
  cancel() {
    this.router.transitionTo('authenticated.campaigns');
  }
}
