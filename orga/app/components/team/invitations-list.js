import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class TeamInvitationsListComponent extends Component {
  @service store;
  @service notifications;
  @service currentUser;

  @action
  async cancelInvitation(organizationInvitation) {
    try {
      const organizationId = this.currentUser.organization.id;
      await this.store.queryRecord('organization-invitation', {
        organizationInvitationId: organizationInvitation.id,
        organizationId,
      });

      this.notifications.sendSuccess("L'invitation a bien été annulée");
    } catch (e) {
      this.notifications.error('Une erreur est survenue. Veuillez recommencer.');
    }
  }
}
