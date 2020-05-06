import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class TermsOfServiceRoute extends Route.extend(AuthenticatedRouteMixin) {

  @service store;

  model() {
    const users = this.store.peekAll('user');
    const user = users.firstObject;

    if (!user.mustValidateTermsOfService) {
      return this.replaceWith('profile');
    }

    return user;
  }
}
