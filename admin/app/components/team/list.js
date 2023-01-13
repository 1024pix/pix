import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class List extends Component {
  @service store;
  @service notifications;
  @service errorResponseHandler;
  @tracked displayConfirm = false;
  @tracked editionMode = false;
  @tracked newRole;
  @tracked confirmPopUpMessage;

  CUSTOM_ERROR_STATUS_MESSAGES = {
    DEACTIVATE: {
      STATUS_422: 'Impossible de désactiver cet agent.',
    },
    UPDATE: {
      STATUS_422: 'Erreur lors de la mise à jour du rôle de cet agent Pix.',
    },
  };

  @action
  async toggleEditionModeForThisMember(adminMember) {
    adminMember.isInEditionMode = true;
  }

  @action
  setAdminRoleSelection(value) {
    this.newRole = value;
  }

  @action
  async updateMemberRole(adminMember) {
    const previousRole = adminMember.role;

    if (!this.newRole || this.newRole === previousRole) {
      adminMember.isInEditionMode = false;
      return;
    }

    adminMember.role = this.newRole;
    try {
      await adminMember.save();
      this.notifications.success(
        `L'agent ${adminMember.firstName} ${adminMember.lastName} a désormais le rôle ${this.newRole}`
      );
    } catch (errorResponse) {
      this.errorResponseHandler.notify(errorResponse, this.CUSTOM_ERROR_STATUS_MESSAGES.UPDATE);
      adminMember.role = previousRole;
    } finally {
      adminMember.isInEditionMode = false;
    }
  }

  @action
  async deactivateAdminMember(adminMemberToDeactivate) {
    try {
      await this.adminMemberToDeactivate.deactivate();
      this.toggleDisplayConfirm();
      this.notifications.success(
        `L'agent ${adminMemberToDeactivate.firstName} ${adminMemberToDeactivate.lastName} n'a plus accès à Pix Admin.`
      );
    } catch (errorResponse) {
      this.toggleDisplayConfirm();

      this.errorResponseHandler.notify(errorResponse, this.CUSTOM_ERROR_STATUS_MESSAGES.DEACTIVATE);
    }
  }

  @action
  displayDeactivateConfirmationPopup(adminMember) {
    this.adminMemberToDeactivate = adminMember;
    this.confirmPopUpMessage = `Etes-vous sûr de vouloir supprimer l'accès de ${adminMember.firstName} ${adminMember.lastName} ?`;
    this.toggleDisplayConfirm();
  }

  @action
  toggleDisplayConfirm() {
    this.displayConfirm = !this.displayConfirm;
  }
}
