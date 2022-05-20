import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import isEmailValid from '../../../../utils/email-validator';

export default class InvitationsController extends Controller {
  @tracked userEmailToInvite = null;
  @tracked userEmailToInviteError;
  @tracked email = null;
  @service notifications;
  @service store;
  @tracked organizationInvitationLang = this.languagesOptions[0].value;
  @tracked organizationInvitationRole = this.rolesOptions[0].value;

  get languagesOptions() {
    return [
      {
        label: 'Français',
        value: 'fr-fr',
      },
      {
        label: 'Francophone',
        value: 'fr',
      },
      {
        label: 'Anglais',
        value: 'en',
      },
    ];
  }

  get rolesOptions() {
    return [
      {
        label: 'Automatique',
        value: 'NULL',
      },
      {
        label: 'Rôle Membre',
        value: 'MEMBER',
      },
      {
        label: 'Rôle Administrateur',
        value: 'ADMIN',
      },
    ];
  }

  get organizationInvitationRoleValue() {
    return this.organizationInvitationRole === 'NULL' ? null : this.organizationInvitationRole;
  }

  @action
  changeOrganizationInvitationRole(event) {
    this.organizationInvitationRole = event.target.value ? event.target.value : null;
  }

  @action
  changeOrganizationInvitationLang(event) {
    this.organizationInvitationLang = event.target.value;
  }

  @action
  async createOrganizationInvitation() {
    this.isLoading = true;
    const email = this.userEmailToInvite?.trim();
    if (!this._isEmailToInviteValid(email)) {
      this.isLoading = false;
      return;
    }

    try {
      const organizationInvitation = await this.store.queryRecord('organization-invitation', {
        email,
        lang: this.organizationInvitationLang,
        role: this.organizationInvitationRoleValue,
        organizationId: this.model.organization.id,
      });

      this.notifications.success(`Un email a bien a été envoyé à l'adresse ${organizationInvitation.email}.`);
      this.userEmailToInvite = null;
    } catch (e) {
      this.notifications.error('Une erreur s’est produite, veuillez réessayer.');
    }
    this.isLoading = false;
  }

  _isEmailToInviteValid(email) {
    if (!email) {
      this.userEmailToInviteError = 'Ce champ est requis.';
      return false;
    }

    if (!isEmailValid(email)) {
      this.userEmailToInviteError = "L'adresse e-mail saisie n'est pas valide.";
      return false;
    }

    this.userEmailToInviteError = null;
    return true;
  }

  @action
  onChangeUserEmailToInvite(event) {
    this.userEmailToInvite = event.target.value;
  }

  get sortedInvitations() {
    return this.model.organizationInvitations.sortBy('updatedAt').reverse();
  }
}
