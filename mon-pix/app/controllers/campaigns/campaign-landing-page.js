import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Controller from '@ember/controller';

@classic
export default class CampaignLandingPageController extends Controller {
  queryParams = ['participantExternalId'];
  participantExternalId = null;
  isLoading = false;
  pageTitle = 'Présentation';

  @action
  startCampaignParticipation() {
    this.set('isLoading', true);
    return this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
      queryParams: { hasSeenLanding: true, participantExternalId: this.participantExternalId }
    });
  }
}
