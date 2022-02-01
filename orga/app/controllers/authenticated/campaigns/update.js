import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class UpdateController extends Controller {
  @tracked campaignName;

  @action
  update(event) {
    event.preventDefault();
    return this.model.campaign
      .save()
      .then((campaign) => this.transitionToRoute('authenticated.campaigns.campaign.settings', campaign.id));
  }

  @action
  cancel(campaignId) {
    this.transitionToRoute('authenticated.campaigns.campaign.settings', campaignId);
  }
}
