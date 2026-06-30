import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import uniq from 'lodash/uniq';

export default class TrainingDetailsTargetProfilesController extends Controller {
  @service store;
  @service router;
  @service featureToggles;
  @tracked targetProfilesToAttach = '';
  @tracked showModal;
  @tracked targetProfileToDetach;

  @service accessControl;
  @service pixToast;

  get canAttachTargetProfiles() {
    return this.accessControl.hasAccessToTrainingsActionsScope;
  }

  get noTargetProfilesToAttach() {
    return this.targetProfilesToAttach === '';
  }

  @action
  openModal(targetProfile) {
    this.showModal = true;
    this.targetProfileToDetach = targetProfile;
  }

  @action
  closeModal() {
    this.showModal = false;
    this.targetProfileToDetach = null;
  }

  @action
  onChangeTargetProfilesToAttach(event) {
    this.targetProfilesToAttach = event.target.value;
  }

  @action
  async attachTargetProfiles(e) {
    e.preventDefault();
    if (this.noTargetProfilesToAttach) return;

    const { training, targetProfileSummaries } = this.model;

    try {
      const targetProfileIdsBefore = targetProfileSummaries.map(({ id }) => id);
      const targetProfileIdsToAttach = this._getUniqueTargetProfileIds();
      const adapter = this.store.adapterFor('training');
      await adapter.attachTargetProfile({
        trainingId: training.id,
        targetProfileIds: targetProfileIdsToAttach,
      });
      await targetProfileSummaries.reload();
      const targetProfileIdsAfter = targetProfileSummaries.map(({ id }) => id);
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
            ', ',
          )}.`,
        );
      }
      this.targetProfilesToAttach = '';
      return this.pixToast.sendSuccessNotification({ message: message.join('') });
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  @action
  async detachTargetProfile(targetProfile) {
    const { id: trainingId } = this.model.training;
    const { targetProfileSummaries } = this.model;
    const { id: targetProfileId } = targetProfile;

    try {
      const adapter = this.store.adapterFor('training');
      await adapter.detachTargetProfile({
        trainingId,
        targetProfileId,
      });
      this.closeModal();
      await targetProfileSummaries.reload();
      return this.pixToast.sendSuccessNotification({
        message: `Profil cible détaché avec succès !`,
      });
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  @action
  async onClickDetachTargetProfile(targetProfile) {
    if (targetProfile.isPartOfCombinedCourse) {
      this.openModal(targetProfile);
    } else {
      await this.detachTargetProfile(targetProfile);
    }
  }

  _handleResponseError({ errors }) {
    if (!errors) {
      return this.pixToast.sendErrorNotification({ message: 'Une erreur est survenue.' });
    }
    errors.forEach((error) => {
      if (['404', '412'].includes(error.status)) {
        return this.pixToast.sendErrorNotification({ message: error.detail });
      }
      return this.pixToast.sendErrorNotification({ message: 'Une erreur est survenue.' });
    });
  }

  _getUniqueTargetProfileIds() {
    const targetProfileIds = this.targetProfilesToAttach.split(',').map((targetProfileId) => targetProfileId.trim());
    return uniq(targetProfileIds);
  }
}
