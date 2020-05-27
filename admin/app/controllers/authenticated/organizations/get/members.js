import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import isEmailValid from '../../../../utils/email-validator';

export default class GetMembersController extends Controller {

  @tracked userEmailToAdd = null;
  @tracked userEmailToInvite = null;
  @tracked userEmailToInviteError;
  @tracked isLoading = false;

  @service notifications;

  async _getUser(email) {
    const matchingUsers = await this.store.query('user', { filter: { email } });

    // GET /users?filter[email] makes an approximative request ("LIKE %email%") and not a strict request
    return matchingUsers.findBy('email', email);
  }

  @action
  async addMembership() {
    const organization = this.model;
    const email = this.userEmailToAdd.trim();
    if (await organization.hasMember(email)) {
      return this.notifications.error('Compte déjà associé.');
    }

    const user = await this._getUser(email);
    if (!user) {
      return this.notifications.error('Compte inconnu.');
    }
    
    try {
      await this.store.createRecord('membership', { organization, user }).save();
      this.userEmailToAdd = null;
      this.notifications.success('Accès attribué avec succès.');
    } catch (e) {
      this.notifications.error('Une erreur est survenue.');
    }
  }

  @action
  async createOrganizationInvitation() {
    this.isLoading = true;
    const email = this.userEmailToInvite ? this.userEmailToInvite.trim() : null;
    if (!this._isEmailToInviteValid(email)) {
      this.isLoading = false;
      return;
    }

    try {
      const organizationInvitation = await this.store.createRecord('organization-invitation', { email })
        .save({ adapterOptions: { organizationId: this.model.id } });
        
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
      this.userEmailToInviteError = 'L\'adresse email saisie n\'est pas valide.';
      return false;
    }

    this.userEmailToInviteError = null;
    return true;
  }

}
