import { action } from '@ember/object';
import Controller from '@ember/controller';

export default class UpdateController extends Controller {

  @action
  update(event) {
    event.preventDefault();
    return this.model.save().then(
      (campaign) => this.transitionToRoute('authenticated.campaigns.details', campaign.id)
    );
  }

  @action
  cancel(campaignId) {
    this.transitionToRoute('authenticated.campaigns.details', campaignId);
  }
}
