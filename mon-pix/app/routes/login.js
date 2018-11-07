import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import BaseRoute from 'mon-pix/routes/base-route';
import RSVP from 'rsvp';

export default BaseRoute.extend(UnauthenticatedRouteMixin, {

  session: service(),

  routeIfNotAuthenticated: 'connexion',
  routeIfAlreadyAuthenticated: 'compte',
  routeForLoggedUserLinkedToOrganization: 'board',

  beforeModel({ queryParams }) {
    if (queryParams && queryParams.token && queryParams['user-id']) {
      return this.get('session')
        .authenticate('authenticator:simple', { token: queryParams.token, userId: parseInt(queryParams['user-id']) })
        .then((_) => {
          this.transitionTo('compte');
        });
    } else {
      return RSVP.resolve();
    }
  },

  actions: {
    signin(email, password) {
      return this.get('session')
        .authenticate('authenticator:simple', { email, password })
        .then((_) => {
          return this.get('store').queryRecord('user', {});
        });
    }
  }
});
