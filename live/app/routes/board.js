import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import BaseRoute from 'pix-live/routes/base-route';
import RSVP from 'rsvp';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  authenticationRoute: '/connexion',

  session: Ember.inject.service(),

  model() {
    return this.get('store').findRecord('user', this.get('session.data.authenticated.userId'))
      .then((user) => {

        if (user.get('organizations.length') <= 0) {
          return this.transitionTo('compte');
        }

        const organization = user.get('organizations.firstObject');

        return RSVP.hash({
          organization,
          snapshots: organization.get('snapshots').reload()
        });
      })
      .catch(_ => {
        this.transitionTo('index');
      });
  }
});
