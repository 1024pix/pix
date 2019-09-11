import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(UnauthenticatedRouteMixin, {

  session: service(),

  actions: {
    authenticate(email, password) {
      const scope = 'mon-pix';
      return this.session.authenticate('authenticator:oauth2', email, password, scope);
    }
  }
});
