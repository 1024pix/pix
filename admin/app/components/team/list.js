import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class List extends Component {
  @service store;
  @service notifications;
  @tracked displayConfirm = false;

  @tracked editionMode = false;
  @tracked newRole;
  @tracked confirmPopUpMessage;

  ERROR_MESSAGES = {
    DEFAULT: 'Une erreur est survenue.',
    STATUS_422: 'Impossible de désactiver cet agent.',
  };

  @action
  async toggleEditionModeForThisMember(adminMember) {
    adminMember.isInEditionMode = true;
  }

  @action
  setAdminRoleSelection(event) {
    this.newRole = event.target.value;
  }

  @action
  async updateMemberRole(adminMember) {
    const previousRole = adminMember.role;
    adminMember.role = this.newRole;
    try {
      await adminMember.save();
      this.notifications.success(
        `L'agent ${adminMember.firstName} ${adminMember.lastName} a désormais le rôle ${this.newRole}`
      );
    } catch (err) {
      const { detail } = err.errors?.[0] || {};
      this.notifications.error(detail);
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
      this._handleResponseError(errorResponse);
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

  _handleResponseError(errorResponse) {
    const { errors } = errorResponse;

    if (errors) {
      errors.map((error) => {
        switch (error.status) {
          case 422:
            this.notifications.error(this.ERROR_MESSAGES.STATUS_422);
            break;
          default:
            this.notifications.error(this.ERROR_MESSAGES.DEFAULT);
            break;
        }
      });
    } else {
      this.notifications.error(this.ERROR_MESSAGES.DEFAULT);
    }
  }
}
