import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class JoinRoute extends Route {

  @service router;
  @service session;

  routeIfAlreadyAuthenticated = 'join-when-authenticated';

  beforeModel() {
    this.session.prohibitAuthentication(this.routeIfAlreadyAuthenticated);
  }

  model(params) {
    return this.store.queryRecord('organization-invitation', {
      invitationId: params.invitationId,
      code: params.code,
    }).catch((errorResponse) => {
      errorResponse.errors.forEach((error) => {
        if (error.status === '412') {
          this.router.replaceWith('login', { queryParams: { hasInvitationError: true } });
        }
      });
      this.router.replaceWith('login');
    });
  }
}
