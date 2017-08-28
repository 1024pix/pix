import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {

  authenticationRoute: '/connexion',

  model() {
    return this.get('store').queryRecord('user', {})
      .then((user) => {
        return user.get('organizations.firstObject');
      })
      .catch(_ => {
        this.transitionTo('index');
      });
  }
});
