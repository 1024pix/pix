import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { debounce } from '@ember/runloop';
import isEmailValid from '../../../../utils/email-validator';
import config from 'pix-admin/config/environment';

const DEFAULT_PAGE_NUMBER = 1;

export default class GetMembersController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'firstName', 'lastName', 'email', 'organizationRole'];
  DEBOUNCE_MS = config.pagination.debounce;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked userEmailToAdd = null;
  @tracked userEmailToInvite = null;
  @tracked userEmailToInviteError;
  @tracked isLoading = false;
  @tracked firstName = null;
  @tracked lastName = null;
  @tracked email = null;
  @tracked organizationRole = null;
  pendingFilters = {};

  @service notifications;

  updateFilters() {
    this.setProperties(this.pendingFilters);
    this.pendingFilters = {};
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  triggerFiltering(fieldName, event) {
    const value = event.target.value;
    this.pendingFilters[fieldName] = value;
    debounce(this, this.updateFilters, this.DEBOUNCE_MS);
  }

  @action
  selectRoleForSearch(selectedRole) {
    this.organizationRole = selectedRole;
  }

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

      await organization.memberships.reload({ adapterOptions: {
        'page[size]': this.pageSize,
        'page[number]': this.pageNumber,
        'filter[firstName]': this.firstName,
        'filter[lastName]': this.lastName,
        'filter[email]': this.email,
        'filter[organizationRole]': this.organizationRole,
      } });

      this.userEmailToAdd = null;
      this.notifications.success('Accès attribué avec succès.');
    } catch (e) {
      this.notifications.error('Une erreur est survenue.');
    }
  }

  @action
  async updateMembership(membership) {
    try {
      await membership.save();
      this.notifications.success('Le rôle du membre a été mis à jour avec succès.');
    } catch (e) {
      this.notifications.error('Une erreur est survenue lors de la mise à jour du rôle du membre.');
    }
  }

  @action
  async disableMembership(membership) {
    try {
      await membership.save({ adapterOptions: { disable: true } });
      await this.model.memberships.reload();
      this.notifications.success('Le membre a été désactivé avec succès.');
    } catch (e) {
      this.notifications.error('Une erreur est survenue lors de la désactivation du membre.');
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
