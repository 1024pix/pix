import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(UnauthenticatedRouteMixin, {

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

    authenticateUser(credentials) {
      const { login, password } = credentials;
      const scope = 'mon-pix';
      return this.session.authenticate('authenticator:oauth2', { login, password, scope });
    },
  }
});
