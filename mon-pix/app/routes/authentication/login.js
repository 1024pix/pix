import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class LoginRoute extends Route {
  @service session;
  @service store;
  @service router;

  beforeModel() {
    this.session.prohibitAuthentication('authenticated.user-dashboard');
  }

  @action
  async authenticate(login, password) {
    await this._removeExternalUserContext();

    const scope = 'mon-pix';
    const trimedLogin = login ? login.trim() : '';
    return this.session.authenticate('authenticator:oauth2', { login: trimedLogin, password, scope });
  }

  @action
  async updateExpiredPassword(passwordResetToken) {
    this.store.createRecord('reset-expired-password-demand', { passwordResetToken });
    return this.router.replaceWith('update-expired-password');
  }

  async _removeExternalUserContext() {
    if (this.session.data && this.session.expectedUserId) {
      delete this.session.data.expectedUserId;
    }
    if (this.session.data && this.session.data.externalUser) {
      delete this.session.data.externalUser;
    }
  }
}
