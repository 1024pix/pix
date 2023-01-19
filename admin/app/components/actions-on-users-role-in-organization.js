import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ActionsOnUsersRoleInOrganization extends Component {
  @service notifications;
  @service accessControl;

  @tracked isEditionMode = false;
  @tracked selectedNewRole = null;
  @tracked displayConfirm = false;

  get organizationRoles() {
    return [
      { value: 'ADMIN', label: 'Administrateur' },
      { value: 'MEMBER', label: 'Membre' },
    ];
  }

  @action
  setRoleSelection(value) {
    this.selectedNewRole = value;
    this.isEditionMode = true;
  }

  @action
  async updateRoleOfMember() {
    if (!this.selectedNewRole) return;

    try {
      this.args.organizationMembership.organizationRole = this.selectedNewRole;
      await this.args.organizationMembership.save();
      this.notifications.success('Le rôle du membre a été mis à jour avec succès.');
    } catch (e) {
      this.notifications.error('Une erreur est survenue lors de la mise à jour du rôle du membre.');
    } finally {
      this.isEditionMode = false;
    }
  }

  @action
  cancelUpdateRoleOfMember() {
    this.isEditionMode = false;
    this.selectedNewRole = null;
  }

  @action
  editRoleOfMember() {
    this.isEditionMode = true;
    this.selectedNewRole = null;
  }

  @action
  toggleDisplayConfirm() {
    this.displayConfirm = !this.displayConfirm;
  }

  @action
  async disableOrganizationMembership() {
    try {
      await this.args.organizationMembership.destroyRecord({ adapterOptions: { disable: true } });
      this.notifications.success('Le membre a été désactivé avec succès.');
    } catch (e) {
      this.notifications.error('Une erreur est survenue lors de la désactivation du membre.');
    } finally {
      this.displayConfirm = false;
    }
  }
}
