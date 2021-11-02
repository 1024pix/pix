/* eslint-disable ember/classic-decorator-no-classic-methods */

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

  @action
  async createOrganizationInvitation(lang, role) {
    this.isLoading = true;
    const email = this.userEmailToInvite ? this.userEmailToInvite.trim() : null;
    if (!this._isEmailToInviteValid(email)) {
      this.isLoading = false;
      return;
    }

    const organizationInvitation = this.store.createRecord('organization-invitation', { email, lang, role });

    try {
      await organizationInvitation.save({ adapterOptions: { organizationId: this.model.organization.id } });

      this.notifications.success(`Un email a bien a été envoyé à l'adresse ${organizationInvitation.email}.`);
      this.userEmailToInvite = null;
    } catch (e) {
      await organizationInvitation.destroyRecord();
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
}
