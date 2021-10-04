/* eslint ember/no-actions-hash: 0 */
/* eslint ember/no-classic-classes: 0 */
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import Route from '@ember/routing/route';

export default class InscriptionRoute extends Route.extend(UnauthenticatedRouteMixin) {
  @service session;
  @service store;

  model() {
    // XXX: Model needs to be initialize with empty to handle validations on all fields from Api
    return this.store.createRecord('user', {
      lastName: '',
      firstName: '',
      email: '',
      password: '',
      cgu: false,
    });
  }

  @action
  refresh() {
    this.refresh();
  }

  @action
  authenticateUser(credentials) {
    const { login, password } = credentials;
    const scope = 'mon-pix';
    return this.session.authenticate('authenticator:oauth2', { login, password, scope });
  }
}
