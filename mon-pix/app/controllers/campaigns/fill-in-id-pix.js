import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Controller from '@ember/controller';

export default class FillInIdPix extends Controller {
  @service intl;

  @tracked participantExternalId = null;
  @tracked isLoading = false;
  @tracked errorMessage = null;

  @action
  submit() {
    this.model.errorMessage = null;

    const participantExternalId = this.participantExternalId;

    if (participantExternalId) {
      this.isLoading = true;
      return this.transitionToRoute('campaigns.start-or-resume', this.model, { queryParams: { participantExternalId } });
    } else {
      return this.errorMessage = this.intl.t('pages.fill-in-id-pix.errors.missing-id-pix-label',  { idPixLabel: this.model.idPixLabel });
    }
  }

  @action
  cancel() {
    this.errorMessage = null;

    return this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
      queryParams: { hasUserSeenLandingPage: false },
    });
  }
}
