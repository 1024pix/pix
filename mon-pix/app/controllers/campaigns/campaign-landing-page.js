import { action } from '@ember/object';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class CampaignLandingPageController extends Controller {
  @service campaignStorage;
  @service router;

  @action
  startCampaignParticipation() {
    return this.router.transitionTo('campaigns.access', this.model.code);
  }
}
