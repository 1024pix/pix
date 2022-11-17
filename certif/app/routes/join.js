import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import get from 'lodash/get';

export default class JoinRoute extends Route {
  @service store;
  @service router;

  queryParams = {
    code: { replace: true },
    invitationId: { replace: true },
  };

  model(params) {
    return this.store
      .queryRecord('certification-center-invitation', {
        invitationId: params.invitationId,
        code: params.code,
      })
      .catch((errorResponse) => {
        const status = get(errorResponse, 'errors[0].status');
        const transition = this.router.replaceWith('login');

        if (status === '403') {
          transition.data.isInvitationCancelled = true;
        } else if (status === '412') {
          transition.data.hasInvitationAlreadyBeenAccepted = true;
        }
      });
  }
}
