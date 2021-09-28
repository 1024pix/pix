import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class TermsOfServiceRoute extends Route {

  @service store;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model() {
    const users = this.store.peekAll('user');
    const user = users.firstObject;

    if (!user.mustValidateTermsOfService) {
      return this.replaceWith('');
    }

    return user;
  }
}
