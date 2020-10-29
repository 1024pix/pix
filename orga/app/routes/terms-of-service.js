// eslint-disable-next-line ember/no-mixins
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class TermsOfServiceRoute extends Route.extend(AuthenticatedRouteMixin) {

  @service currentUser;

  beforeModel(transition) {
    super.beforeModel(...arguments);
    if (transition.isAborted) {
      return;
    }
    if (this.currentUser.prescriber.pixOrgaTermsOfServiceAccepted) {
      return this.replaceWith('');
    }
  }

}
