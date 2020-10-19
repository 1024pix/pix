import { action } from '@ember/object';
import Controller from '@ember/controller';

export default class CampaignLandingPageController extends Controller {

  @action
  startCampaignParticipation() {
    return this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
      queryParams: { hasUserSeenLandingPage: true },
    });
  }
}
