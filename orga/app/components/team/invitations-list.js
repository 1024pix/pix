import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class TeamInvitationsListComponent extends Component {
  @service store;
  @service notifications;
  @service currentUser;
  @service intl;

  @action
  async cancelInvitation(organizationInvitation) {
    try {
      const organizationId = this.currentUser.organization.id;

      organizationInvitation.deleteRecord();
      await organizationInvitation.save({
        adapterOptions: { organizationInvitationId: organizationInvitation.id, organizationId },
      });

      this.notifications.sendSuccess(this.intl.t('pages.team-invitations.invitation-cancelled-succeed-message'));
    } catch (e) {
      this.notifications.sendError(this.intl.t('api-error-messages.global'));
    }
  }
}
