import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class LoginRoute extends Route {
  @service session;

  beforeModel() {
    this.session.prohibitAuthentication('authenticated');
  }

  setupController(controller, model, transition) {
    if (transition?.data?.isInvitationCancelled) {
      controller.set('isInvitationCancelled', true);
    }
    if (transition?.data?.hasInvitationAlreadyBeenAccepted) {
      controller.set('hasInvitationAlreadyBeenAccepted', true);
    }
  }
}
