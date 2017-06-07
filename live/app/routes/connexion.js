import Ember from 'ember';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default Ember.Route.extend(UnauthenticatedRouteMixin, {

  session: Ember.inject.service(),

  routeIfAlreadyAuthenticated: '/compte',

  actions: {
    signin(email, password) {
      return this.get('store')
        .createRecord('authentication', { email, password })
        .save()
        .then(login => {
          this.get('session').authenticate('authenticator:simple', login.get('token'));
          this.transitionTo(this.routeIfAlreadyAuthenticated);
        });
    }
  }
});
