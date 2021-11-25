import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class TeamInvitationsListComponent extends Component {
  @service store;
  @service notifications;
  @service currentUser;
  @service intl;

  @action
  async cancelInvitation(organizationInvitation) {
    try {
      const organizationId = this.currentUser.organization.id;
      await this.store.queryRecord('organization-invitation', {
        organizationInvitationId: organizationInvitation.id,
        organizationId,
      });

      this.notifications.success(this.intl.t('pages.team-invitations.invitation-cancelled-succeed-message'));
    } catch (e) {
      this.notifications.error(this.intl.t('api-errors-messages.global'));
    }
  }
}
