import { action } from '@ember/object';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class FillInParticipantExternalId extends Controller {
  @service campaignStorage;
  @service router;

  @action
  onSubmitParticipantExternalId(participantExternalId) {
    this.campaignStorage.set(this.model.code, 'participantExternalId', participantExternalId);
    return this.router.transitionTo('campaigns.entrance', this.model);
  }

  @action
  onCancel() {
    return this.router.transitionTo('campaigns.campaign-landing-page', this.model.code);
  }
}
