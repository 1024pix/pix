import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend(UnauthenticatedRouteMixin, {

  session: service(),

  model() {
    // XXX: Model needs to be initialize with empty to handle validations on all fields from Api
    return this.store.createRecord('user', {
      lastName: '',
      firstName: '',
      email: '',
      password: '',
      cgu: false
    });
  },

  actions: {
    refresh() {
      this.refresh();
    },

    redirectToProfileRoute({ email, password }) {
      return this.get('session')
        .authenticate('authenticator:simple', email, password)
        .then(() => {
          return this.get('store').queryRecord('user', {});
        })
        .then(() => {
          this.transitionTo('compte');
        });
    }
  }
});
