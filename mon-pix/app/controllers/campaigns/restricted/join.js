import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class JoinRestrictedCampaignController extends Controller {
  queryParams = ['participantExternalId'];
  participantExternalId = null;

  @service session;
  @service store;
  @service intl;
  @service currentUser;

  @action
  reconcile(schoolingRegistration, adapterOptions) {
    return schoolingRegistration.save({ adapterOptions }).then(() => {
      this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
        queryParams: { associationDone: true, participantExternalId: this.participantExternalId }
      });
    });
  }

  @action
  async createAndReconcile(externalUser) {
    const response = await externalUser.save();

    this.session.set('data.externalUser', null);
    await this.session.authenticate('authenticator:oauth2', { token: response.accessToken });
    await this.currentUser.load();

    return this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
      queryParams: { associationDone: true, participantExternalId: this.participantExternalId }
    });
  }
}
