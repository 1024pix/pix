import { action } from '@ember/object';
import Controller from '@ember/controller';

export default class UpdateController extends Controller {
  @action
  update(campaign) {
    return campaign.save().then(
      (campaign) => this.transitionToRoute('authenticated.campaigns.details', campaign.id)
    );
  }

  @action
  cancel(campaignId) {
    this.transitionToRoute('authenticated.campaigns.details', campaignId);
  }
}
