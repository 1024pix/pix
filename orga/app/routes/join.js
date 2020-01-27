import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default Route.extend(UnauthenticatedRouteMixin, {

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
});
