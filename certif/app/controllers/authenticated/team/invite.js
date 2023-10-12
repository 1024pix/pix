import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class AuthenticatedTeamInviteController extends Controller {
  @service currentUser;
  @service intl;
  @service notifications;
  @service router;
  @service store;

  emails = null;

  @action
  async createCertificationCenterInvitation(event) {
    event.preventDefault();

    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    const emails = this.emails?.replace(/ /g, '').split(',');

    try {
      await this.store.adapterFor('certification-center-invitation').sendInvitations({ certificationCenterId, emails });

      const message = this.intl.t('pages.team-invite.notifications.success.invitations', {
        emailsCount: emails.length,
        email: emails[0],
      });

      this.notifications.success(message);

      this.router.transitionTo('authenticated.team.list.invitations');
    } catch (error) {
      this.notifications.error();
    }
  }

  @action
  updateEmail(event) {
    this.emails = event.target?.value;
  }

  @action
  cancel() {
    this.router.transitionTo('authenticated.team.list.invitations');
  }
}
