import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import uniq from 'lodash/uniq';

export default class TrainingDetailsTargetProfilesController extends Controller {
  @tracked targetProfilesToAttach = '';

  @service notifications;

  get noTargetProfilesToAttach() {
    return this.targetProfilesToAttach === '';
  }

  @action
  async attachTargetProfiles(e) {
    e.preventDefault();
    if (this.noTargetProfilesToAttach) return;

    const training = this.model;

    try {
      const targetProfileIdsBefore = training.get('targetProfileSummaries').map(({ id }) => id);
      const targetProfileIdsToAttach = this._getUniqueTargetProfileIds();
      await training.attachTargetProfiles({
        'target-profile-ids': targetProfileIdsToAttach,
      });
      await training.get('targetProfileSummaries').reload();
      const targetProfileIdsAfter = training.get('targetProfileSummaries').map(({ id }) => id);
      const attachedIds = targetProfileIdsAfter.filter((id) => !targetProfileIdsBefore.includes(id));
      const duplicatedIds = targetProfileIdsBefore.filter((id) => targetProfileIdsToAttach.includes(id));
      const hasInserted = attachedIds.length > 0;
      const hasDuplicated = duplicatedIds.length > 0;
      const message = [];
      if (hasInserted) {
        message.push('Profil(s) cible(s) rattaché(s) avec succès.');
      }
      if (hasInserted && hasDuplicated) {
        message.push('<br/>');
      }
      if (hasDuplicated) {
        message.push(
          `Le(s) profil(s) cible(s) suivant(s) étai(en)t déjà rattaché(s) à ce contenu formatif : ${duplicatedIds.join(
            ', '
          )}.`
        );
      }
      this.targetProfilesToAttach = '';
      return this.notifications.success(message.join(''), { htmlContent: true });
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  _handleResponseError({ errors }) {
    if (!errors) {
      return this.notifications.error('Une erreur est survenue.');
    }
    errors.forEach((error) => {
      if (['404', '412'].includes(error.status)) {
        return this.notifications.error(error.detail);
      }
      return this.notifications.error('Une erreur est survenue.');
    });
  }

  _getUniqueTargetProfileIds() {
    const targetProfileIds = this.targetProfilesToAttach.split(',').map((targetProfileId) => targetProfileId.trim());
    return uniq(targetProfileIds);
  }
}
