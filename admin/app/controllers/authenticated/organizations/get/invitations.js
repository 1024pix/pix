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

  @action
  async createOrganizationInvitation(lang, role) {
    this.isLoading = true;
    const email = this.userEmailToInvite?.trim();
    if (!this._isEmailToInviteValid(email)) {
      this.isLoading = false;
      return;
    }

    try {
      const organizationInvitation = await this.store.queryRecord('organization-invitation', {
        email,
        lang,
        role,
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
}
