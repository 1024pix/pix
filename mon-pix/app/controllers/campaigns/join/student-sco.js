import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class StudentScoController extends Controller {
  @service currentUser;
  @service campaignStorage;
  @service session;
  @service store;

  @tracked displayRegisterForm = true;

  @action
  toggleFormsVisibility() {
    this.displayRegisterForm = !this.displayRegisterForm;
  }

  @action
  async addGarAuthenticationMethodToUser(externalUserAuthenticationRequest) {
    await externalUserAuthenticationRequest.save();

    await this.session.authenticate('authenticator:oauth2', { token: externalUserAuthenticationRequest.accessToken });

    this.session.revokeGarAuthenticationContext();

    await this.currentUser.load();
    await this._reconcileUser();

    this.campaignStorage.set(this.model.campaign.code, 'associationDone', true);
  }

  _reconcileUser() {
    return this.store
      .createRecord('sco-organization-learner', {
        userId: this.currentUser.user.id,
        organizationId: this.model.campaign.organizationId,
      })
      .save({ adapterOptions: { tryReconciliation: true } });
  }
}
