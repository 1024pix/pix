import _ from 'lodash';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import isEmailValid from '../../../utils/email-validator';

export default class GetController extends Controller {

  @tracked userEmailToAdd = null;
  @tracked userEmailToInvite = null;
  @tracked userEmailToInviteError;
  @tracked targetProfilesToAttach = [];
  @tracked isLoading = false;

  @service notifications;

  @action
  updateOrganizationInformation() {
    return this.model.save();
  }

  @action
  attachTargetProfiles() {
    const organization = this.model;
    return organization.attachTargetProfiles({ 'target-profiles-to-attach' : this._toArrayWithUnique(this.targetProfilesToAttach) })
      .then(async () => {
        this.targetProfilesToAttach = null;
        return this.notifications.success('Profil(s) cible(s) rattaché avec succès.');
      })
      .catch((errorResponse) => {
        if (!errorResponse.errors) {
          return this.notifications.error('Une erreur est survenue.');
        }

        errorResponse.errors.forEach((error) => {
          if (error.status === '404') {
            return this.notifications.error(error.detail);
          }
        });
      });
  }

  @action
  async addMembership() {
    const email = this.userEmailToAdd.trim();
    const organization = this.model;
    const matchingUsers = await this.store.query('user', { filter: { email } });

    // GET /users?filter[email] makes an approximative request ("LIKE %email%") and not a strict request
    const user = matchingUsers.findBy('email', email);

    if (!user) {
      return this.notifications.error('Compte inconnu.');
    }

    if (await organization.hasMember(email)) {
      return this.notifications.error('Compte déjà associé.');
    }

    return this.store.createRecord('membership', { organization, user })
      .save()
      .then(async () => {
        this.userEmailToAdd = null;
        this.notifications.success('Accès attribué avec succès.');
      })
      .catch(() => {
        this.notifications.error('Une erreur est survenue.');
      });
  }

  @action
  createOrganizationInvitation() {
    this.isLoading = true;
    if (!this._isEmailToInviteValid(this.userEmailToInvite)) {
      this.isLoading = false;
      return;
    }
    const email = this.userEmailToInvite.trim();

    return this.store.createRecord('organization-invitation', { email })
      .save({ adapterOptions: { organizationId: this.model.id } })
      .then((organizationInvitation) => {
        this.notifications.success(`Un email a bien a été envoyé à l'adresse ${organizationInvitation.email}.`);
        this.userEmailToInvite = null;
      })
      .catch(() => this.notifications.error('Une erreur s’est produite, veuillez réessayer.'))
      .finally(() => this.isLoading = false);
  }

  _toArrayWithUnique(targetProfilesToAttach) {
    const trimedTargetProfilesToAttach = targetProfilesToAttach.split(',').map((targetProfileId) => targetProfileId.trim());
    return _.uniq(trimedTargetProfilesToAttach);
  }

  _isEmailToInviteValid(email) {
    if (!email || !email.trim()) {
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
