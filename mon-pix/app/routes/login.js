import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import Route from '@ember/routing/route';

@classic
export default class LoginRoute extends Route.extend(UnauthenticatedRouteMixin) {
  @service session;

  @action
  async authenticate(login, password) {
    const scope = 'mon-pix';
    const trimedLogin = login ? login.trim() : '';
    return this.session.authenticate('authenticator:oauth2', { login: trimedLogin, password, scope });
  }
}
