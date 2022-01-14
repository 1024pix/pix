import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class TermsOfServiceRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service currentUser;
  @service session;

  beforeModel() {
    const isUserExternal = Boolean(this.session.data.externalUser);
    if (isUserExternal || !this.currentUser.user.mustValidateTermsOfService) {
      if (this.session.attemptedTransition) {
        this.session.attemptedTransition.retry();
      } else {
        this.replaceWith('');
      }
    }
  }

  model() {
    return this.currentUser.user;
  }
}
