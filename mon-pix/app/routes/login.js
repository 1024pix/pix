import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import Route from '@ember/routing/route';

export default class LoginRoute extends Route.extend(UnauthenticatedRouteMixin) {
  @service session;
  @service store;

  @action
  async authenticate(login, password) {

    await this._removeExternalUserContext();

    const scope = 'mon-pix';
    const trimedLogin = login ? login.trim() : '';
    return this.session.authenticate('authenticator:oauth2', { login: trimedLogin, password, scope });
  }

  @action
  async updateExpiredPassword(username, password) {
    this.store.createRecord('reset-expired-password-demand', { username, oneTimePassword: password });
    return this.replaceWith('update-expired-password');
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
