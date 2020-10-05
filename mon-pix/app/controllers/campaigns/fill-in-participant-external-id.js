import { action } from '@ember/object';
import Controller from '@ember/controller';

export default class FillInParticipantExternalId extends Controller {
  @action
  onSubmitParticipantExternalId(participantExternalId) {
    return this.transitionToRoute('campaigns.start-or-resume', this.model, { queryParams: { participantExternalId } });
  }

  @action
  onCancel() {
    return this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
      queryParams: { hasUserSeenLandingPage: false },
    });
  }
}
