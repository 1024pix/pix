import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class FillInParticipantExternalId extends Controller {
  @service campaignStorage;
  @service router;

  @action
  onSubmitParticipantExternalId(participantExternalId) {
    this.campaignStorage.set(this.model.code, 'participantExternalId', participantExternalId);
    this.router.transitionTo('campaigns.entrance', this.model);
    return;
  }

  @action
  onCancel() {
    this.router.transitionTo('campaigns.campaign-landing-page', this.model.code);
    return;
  }
}
