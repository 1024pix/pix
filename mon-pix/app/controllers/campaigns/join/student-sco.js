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

    await this._clearExternalUserContext();

    await this.currentUser.load();
    await this._reconcileUser();

    this.campaignStorage.set(this.model.code, 'associationDone', true);
  }

  _reconcileUser() {
    return this.store
      .createRecord('sco-organization-learner', {
        userId: this.currentUser.user.id,
        campaignCode: this.model.code,
      })
      .save({ adapterOptions: { tryReconciliation: true } });
  }

  _clearExternalUserContext() {
    this.session.set('data.externalUser', null);
    this.session.set('data.expectedUserId', null);
  }
}
