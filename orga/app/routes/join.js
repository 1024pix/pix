import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class JoinRoute extends Route {
  @service router;
  @service session;
  @service store;

  routeIfAlreadyAuthenticated = 'join-when-authenticated';
  @tracked isInvitationCancelled = false;
  @tracked hasInvitationAlreadyBeenAccepted = false;

  beforeModel() {
    this.session.prohibitAuthentication(this.routeIfAlreadyAuthenticated);
  }

  model(params) {
    return this.store
      .queryRecord('organization-invitation', {
        invitationId: params.invitationId,
        code: params.code,
      })
      .catch((errorResponse) => {
        errorResponse.errors.forEach((error) => {
          if (error.status === '403') {
            this.isInvitationCancelled = true;
          }
          if (error.status === '412') {
            this.hasInvitationAlreadyBeenAccepted = true;
          }
        });
      });
  }

  async redirect(model) {
    if (!model) {
      const transition = this.router.replaceWith('login');
      transition.data.isInvitationCancelled = this.isInvitationCancelled;
      transition.data.hasInvitationAlreadyBeenAccepted = this.hasInvitationAlreadyBeenAccepted;

      return transition;
    }
  }
}
