import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class UpdateController extends Controller {
  @service router;

  @action
  update() {
    return this.model.campaign
      .save()
      .then((campaign) => this.router.transitionTo('authenticated.campaigns.campaign.settings', campaign.id));
  }

  @action
  cancel(campaignId) {
    this.router.transitionTo('authenticated.campaigns.campaign.settings', campaignId);
  }
}
