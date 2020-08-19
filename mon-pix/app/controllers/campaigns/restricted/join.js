import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class JoinRestrictedCampaignController extends Controller {
  queryParams = ['participantExternalId'];
  participantExternalId = null;

  @service session;
  @service store;
  @service intl;

  @action
  attemptNext(schoolingRegistration, adapterOptions) {
    return schoolingRegistration.save({ adapterOptions }).then(() => {
      this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
        queryParams: { associationDone: true, participantExternalId: this.participantExternalId }
      });
    });
  }
}
