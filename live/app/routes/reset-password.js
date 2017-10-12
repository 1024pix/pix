import Ember from 'ember';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend(UnauthenticatedRouteMixin, {

  session: Ember.inject.service(),

  model(params) {
    const temporaryKey = params.temporaryKey;

    return this.get('store')
      .findRecord('password-reset-demand', temporaryKey)
      .catch(() => this.transitionTo('index'));

  }
});
