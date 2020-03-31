import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import Route from '@ember/routing/route';

@classic
export default class LoginRoute extends Route.extend(UnauthenticatedRouteMixin) {
  @service session;
  @service store;

  @action
  async authenticate(login, password) {
    const scope = 'mon-pix';
    const trimedLogin = login ? login.trim() : '';
    return this.session.authenticate('authenticator:oauth2', { login: trimedLogin, password, scope });
  }

  @action
  async updateExpiredPassword(username, password) {
    this.store.createRecord('user', { username, password });
    return this.replaceWith('update-expired-password');
  }
}
