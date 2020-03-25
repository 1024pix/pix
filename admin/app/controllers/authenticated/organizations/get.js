import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';

export default class GetController extends Controller {

  @tracked userEmail = null;
  @tracked targetProfilesToAttach = [];

  @service notifications;

  @action
  updateOrganizationInformation() {
    return this.model.save();
  }

  @action
  attachTargetProfiles() {
    const organization = this.model;
    return this.store.createRecord('target-profile-attachment', {
      id: `${organization.id}_${this.targetProfilesToAttach}`,
      targetProfilesToAttach: this._toArrayWithUnique(this.targetProfilesToAttach), organization
    })
      .save({ adapterOptions: { organizationId: organization.id } })
      .then(async () => {
        this.targetProfilesToAttach = null;
        this.model.targetProfiles.reload();
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
    const email = this.userEmail.trim();
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
        this.userEmail = null;
        this.notifications.success('Accès attribué avec succès.');
      })
      .catch(() => {
        this.notifications.error('Une erreur est survenue.');
      });
  }

  _toArrayWithUnique(targetProfilesToAttach) {
    const trimedTargetProfilesToAttach = targetProfilesToAttach.split(',').map((targetProfileId) => targetProfileId.trim());
    return [...new Set(trimedTargetProfilesToAttach)];
  }

}
