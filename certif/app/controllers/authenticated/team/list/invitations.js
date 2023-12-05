import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class AuthenticatedTeamListInvitationsController extends Controller {
  @service intl;
  @service notifications;

  @action
  async cancelInvitation(certificationCenterInvitation) {
    try {
      await certificationCenterInvitation.destroyRecord();
      this.notifications.success(this.intl.t('pages.team-invitations.notifications.success.invitation-cancelled'));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      this.notifications.error(this.intl.t('common.api-error-messages.internal-server-error'));
    }
  }

  @action
  async resendInvitation(certificationCenterInvitation) {
    try {
      await certificationCenterInvitation.save();
      this.notifications.success(this.intl.t('pages.team-invitations.notifications.success.invitation-resent'));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      this.notifications.error(this.intl.t('common.api-error-messages.internal-server-error'));
    }
  }
}
