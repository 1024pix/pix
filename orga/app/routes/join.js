import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default class JoinRoute extends Route.extend(UnauthenticatedRouteMixin) {

  routeIfAlreadyAuthenticated = 'join-when-authenticated';

  model(params) {
    return this.store.queryRecord('organization-invitation', {
      invitationId: params.invitationId,
      code: params.code
    }).catch((errorResponse) => {
      errorResponse.errors.forEach((error) => {
        if (error.status === '421') {
          this.replaceWith('login', { queryParams: { hasInvitationError: true } });
        }
      });
      this.replaceWith('login');
    });
  }
}
