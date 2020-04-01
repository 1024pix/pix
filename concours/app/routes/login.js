import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(UnauthenticatedRouteMixin, {

  session: service(),

  actions: {
    async authenticate(login, password) {
      const scope = 'mon-pix';
      const trimedLogin = login ? login.trim() : '';
      return this.session.authenticate('authenticator:oauth2', { login: trimedLogin, password, scope });
    }
  }
});
