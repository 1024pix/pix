import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class InscriptionRoute extends Route {
  @service session;
  @service store;
  @service featureToggles;
  @service router;
  @service currentUser;

  get isAnonymous() {
    return Boolean(this.currentUser?.user?.isAnonymous);
  }

  beforeModel() {
    if (this.isAnonymous) {
      return;
    }
    this.session.prohibitAuthentication('authenticated.user-dashboard');
  }

  model() {
    if (this.isAnonymous) {
      return this.currentUser.user;
    }
    // XXX: Model needs to be initialize with empty to handle validations on all fields from Api
    return this.store.createRecord('user', {
      lastName: '',
      firstName: '',
      email: '',
      password: '',
      cgu: false,
    });
  }
}
