import { action } from '@ember/object';
import Controller from '@ember/controller';
import ENV from 'mon-pix/config/environment';

export default class CampaignLandingPageController extends Controller {

  get isNotPixConcours() {
    return this.model.isTypeAssessment && ENV.APP.IS_PIX_CONCOURS === 'false';
  }

  @action
  startCampaignParticipation() {
    return this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
      queryParams: { hasUserSeenLandingPage: true },
    });
  }
}
