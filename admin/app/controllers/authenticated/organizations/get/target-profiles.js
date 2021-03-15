import uniq from 'lodash/uniq';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';

export default class GetTargetProfilesController extends Controller {

  @tracked targetProfilesToAttach = [];

  @service notifications;

  @action
  async attachTargetProfiles() {
    const organization = this.model;
    try {
      await organization.attachTargetProfiles({ 'target-profiles-to-attach': this._getUniqueTargetProfiles() });
      this.targetProfilesToAttach = null;
      return this.notifications.success('Profil(s) cible(s) rattaché avec succès.');
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  @action
  goToTargetProfilePage(targetProfileId) {
    this.transitionToRoute('authenticated.target-profiles.target-profile', targetProfileId);
  }

  _handleResponseError({ errors }) {
    if (!errors) {
      return this.notifications.error('Une erreur est survenue.');
    }

    const error = errors.find(({ status }) => ['404', '409'].includes(status));

    if (error) {
      this.notifications.error(error.detail);
    }
  }

  _getUniqueTargetProfiles() {
    const targetProfileIds = this.targetProfilesToAttach.split(',').map((targetProfileId) => targetProfileId.trim());
    return uniq(targetProfileIds);
  }
}
