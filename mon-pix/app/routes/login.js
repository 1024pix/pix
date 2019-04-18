import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(UnauthenticatedRouteMixin, {

  session: service(),

  beforeModel(transition) {
    if (transition.to.queryParams && transition.to.queryParams.token) {
      return this.session.authenticate(
        'authenticator:simple', { token: transition.to.queryParams.token }
      );
    } else {
      return this._super(...arguments);
    }
  },

  actions: {
    signin(email, password) {
      return this.session.authenticate('authenticator:simple', { email, password });
    }
  }
});
