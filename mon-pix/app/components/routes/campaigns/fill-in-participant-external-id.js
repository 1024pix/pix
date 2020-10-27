import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FillInParticipantExternalId extends Component {
  @service intl;

  @tracked participantExternalId = null;
  @tracked isLoading = false;
  @tracked errorMessage = null;

  @action
  submit(event) {
    event.preventDefault();
    this.errorMessage = null;

    if (this.participantExternalId) {
      return this.args.onSubmit(this.participantExternalId);
    } else {
      this.errorMessage = this.intl.t('pages.fill-in-participant-external-id.errors.missing-id-pix-label', { idPixLabel: this.args.campaign.idPixLabel });
    }
  }

  @action
  cancel() {
    this.errorMessage = null;
    return this.args.onCancel();
  }
}
