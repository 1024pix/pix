import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default Route.extend(UnauthenticatedRouteMixin, {

  model(params) {
    return this.store.queryRecord('organization-invitation', {
      invitationId: params.invitationId,
      code: params.code
    });
  }
});
