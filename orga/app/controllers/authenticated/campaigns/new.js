import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class NewController extends Controller {
  @service router;
  @service store;
  @service notifications;
  @service intl;

  @tracked errors;

  queryParams = ['source'];

  @action
  async createCampaign() {
    this.notifications.clearAll();
    this.errors = null;

    try {
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
    if (this.source) {
      this.router.transitionTo('authenticated.campaigns.campaign.settings', this.source);
    } else {
      this.router.transitionTo('authenticated.campaigns');
    }
  }
}
