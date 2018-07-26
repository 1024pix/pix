import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import BaseRoute from 'mon-pix/routes/base-route';

export default BaseRoute.extend(UnauthenticatedRouteMixin, {

  session: service(),

  routeIfNotAuthenticated: 'connexion',
  routeIfAlreadyAuthenticated: 'compte',
  routeForLoggedUserLinkedToOrganization: 'board',

  actions: {
    signin(email, password) {
      return this.get('session')
        .authenticate('authenticator:simple', email, password)
        .then((_) => {
          return this.get('store').queryRecord('user', {});
        });
    }
  }
});
