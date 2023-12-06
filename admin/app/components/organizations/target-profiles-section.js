import uniq from 'lodash/uniq';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';

export default class OrganizationTargetProfilesSectionComponent extends Component {
  @tracked targetProfilesToAttach = '';
  @tracked showModal = false;
  @tracked targetProfileToDetach;

  @service accessControl;
  @service notifications;
  @service router;
  @service store;

  get isDisabled() {
    return this.targetProfilesToAttach === '';
  }

  @action
  canDetachTargetProfile({ canDetach }) {
    return canDetach;
  }

  @action
  async attachTargetProfiles(e) {
    e.preventDefault();
    if (this.isDisabled) return;

    const organization = this.args.organization;

    try {
      const targetProfileIdsBefore = organization.get('targetProfileSummaries').map(({ id }) => id);
      const targetProfileIdsToAttach = this._getUniqueTargetProfileIds();
      await organization.attachTargetProfiles({
        'target-profile-ids': targetProfileIdsToAttach,
      });
      await organization.get('targetProfileSummaries').reload();
      const targetProfileIdsAfter = organization.get('targetProfileSummaries').map(({ id }) => id);
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
          `Le(s) profil(s) cible(s) suivant(s) étai(en)t déjà rattaché(s) à cette organisation : ${duplicatedIds.join(
            ', ',
          )}.`,
        );
      }
      this.targetProfilesToAttach = '';
      return this.notifications.success(message.join(''), { htmlContent: true });
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  @action
  goToTargetProfilePage(targetProfileId) {
    this.router.transitionTo('authenticated.target-profiles.target-profile', targetProfileId);
  }

  @action
  async detachTargetProfile(targetProfilId) {
    const adapter = this.store.adapterFor('target-profile');

    try {
      await adapter.detachOrganizations(targetProfilId, [this.args.organization.id]);
      this.closeModal();
      await this.args.organization.get('targetProfileSummaries').reload();
      return this.notifications.success('Profil cible détaché avec succès.');
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
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
