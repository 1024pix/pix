import Route from '@ember/routing/route';
import { service } from '@ember/service';
import get from 'lodash/get';

export default class JoinRoute extends Route {
  @service store;
  @service router;

  queryParams = {
    code: { replace: true },
    invitationId: { replace: true },
  };

  model(params, transition) {
    return this.store
      .queryRecord('certification-center-invitation', {
        invitationId: params.invitationId,
        code: params.code,
      })
      .catch((errorResponse) => {
        const status = get(errorResponse, 'errors[0].status');
        transition.abort();
        const newTransition = this.router.replaceWith('login');

        if (status === '403') {
          newTransition.data.isInvitationCancelled = true;
        } else if (status === '412') {
          newTransition.data.hasInvitationAlreadyBeenAccepted = true;
        }
      });
  }
}
