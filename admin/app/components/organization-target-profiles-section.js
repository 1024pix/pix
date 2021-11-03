import uniq from 'lodash/uniq';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';

export default class OrganizationTargetProfilesSectionComponent extends Component {
  @tracked targetProfilesToAttach = '';

  @service notifications;
  @service router;

  get isDisabled() {
    return this.targetProfilesToAttach === '';
  }

  @action
  async attachTargetProfiles(e) {
    e.preventDefault();
    if (this.isDisabled) return;

    const organization = this.args.organization;

    try {
      const response = await organization.attachTargetProfiles({
        'target-profiles-to-attach': this._getUniqueTargetProfiles(),
      });
      const { 'attached-ids': attachedIds, 'duplicated-ids': duplicatedIds } = response.data.attributes;

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

  @action
  goToTargetProfilePage(targetProfileId) {
    this.router.transitionTo('authenticated.target-profiles.target-profile', targetProfileId);
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

  _getUniqueTargetProfiles() {
    const targetProfileIds = this.targetProfilesToAttach.split(',').map((targetProfileId) => targetProfileId.trim());
    return uniq(targetProfileIds);
  }
}
