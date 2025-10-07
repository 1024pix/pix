import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class StudentScoController extends Controller {
  @service currentUser;
  @service accessStorage;
  @service session;
  @service store;

  @tracked displayScoSignupForm = true;

  @action
  toggleFormsVisibility() {
    this.displayScoSignupForm = !this.displayScoSignupForm;
  }

  @action
  async addGarAuthenticationMethodToUser(externalUserAuthenticationRequest) {
    await externalUserAuthenticationRequest.save();

    await this.session.authenticate('authenticator:oauth2', { token: externalUserAuthenticationRequest.accessToken });

    this.session.revokeGarAuthenticationContext();

    await this.currentUser.load();
    await this._reconcileUser();

    this.accessStorage.setAssociationDone(this.model.organizationToJoin.id);
  }

  _reconcileUser() {
    return this.store
      .createRecord('sco-organization-learner', {
        userId: this.currentUser.user.id,
        organizationId: this.model.organizationToJoin.id,
      })
      .save({ adapterOptions: { tryReconciliation: true } });
  }
}
