import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class InscriptionRoute extends Route {
  @service session;
  @service store;

  beforeModel() {
    this.session.prohibitAuthentication('authenticated.user-dashboard');
  }

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
  refreshModel() {
    this.refresh();
  }

  @action
  authenticateUser(credentials) {
    const { login, password } = credentials;
    const scope = 'mon-pix';
    return this.session.authenticate('authenticator:oauth2', { login, password, scope });
  }
}
