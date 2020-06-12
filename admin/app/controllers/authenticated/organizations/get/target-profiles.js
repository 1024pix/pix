import _ from 'lodash';
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
      await organization.attachTargetProfiles({ 'target-profiles-to-attach' : this._getUniqueTargetProfiles() });
      this.targetProfilesToAttach = null;
      return this.notifications.success('Profil(s) cible(s) rattaché avec succès.');
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  _handleResponseError({ errors }) {
    if (!errors) {
      return this.notifications.error('Une erreur est survenue.');
    }
    const error404 = errors.find(({ status }) => status === '404');
    if (error404) {
      this.notifications.error(error404.detail);
    }
  }

  _getUniqueTargetProfiles() {
    const targetProfileIds = this.targetProfilesToAttach.split(',').map((targetProfileId) => targetProfileId.trim());
    return _.uniq(targetProfileIds);
  }
}
