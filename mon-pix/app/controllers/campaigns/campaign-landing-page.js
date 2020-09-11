import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class CampaignLandingPageController extends Controller {

  @tracked isLoading = false;

  @action
  startCampaignParticipation() {
    this.isLoading = true;
    return this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
      queryParams: { hasUserSeenLandingPage: true },
    });
  }
}
