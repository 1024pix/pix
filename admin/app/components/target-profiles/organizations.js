import { action } from '@ember/object';
import Component from '@glimmer/component';
import { service } from '@ember/service';
import uniq from 'lodash/uniq';
import { tracked } from '@glimmer/tracking';

export default class Organizations extends Component {
  @service store;
  @service notifications;
  @service router;
  @service currentUser;

  @tracked organizationsToAttach = '';
  @tracked existingTargetProfile = '';

  get isSuperAdminOrMetier() {
    return this.currentUser.adminMember.isSuperAdmin || this.currentUser.adminMember.isMetier;
  }

  get isDisabledAttachOrganizationsFromExistingTargetProfile() {
    return this.existingTargetProfile === '';
  }

  get isDisabledAttachOrganizations() {
    return this.organizationsToAttach === '';
  }

  @action
  async attachOrganizations(e) {
    e.preventDefault();
    if (this.isDisabledAttachOrganizations) return;

    const targetProfile = this.args.targetProfile;
    try {
      const response = await targetProfile.attachOrganizations({ 'organization-ids': this._getUniqueOrganizations() });

      const { 'attached-ids': attachedIds, 'duplicated-ids': duplicatedIds } = response.data.attributes;

      this.organizationsToAttach = '';
      const hasInsertedOrganizations = attachedIds.length > 0;
      const hasDuplicatedOrgnizations = duplicatedIds.length > 0;
      const message = [];

      if (hasInsertedOrganizations) {
        message.push('Organisation(s) rattaché(es) avec succès.');
      }

      if (hasInsertedOrganizations && hasDuplicatedOrgnizations) {
        message.push('<br/>');
      }

      if (hasDuplicatedOrgnizations) {
        message.push(
          `Le(s) organisation(s) suivantes étai(en)t déjà rattachée(s) à ce profil cible : ${duplicatedIds.join(', ')}`,
        );
      }

      await this.notifications.success(message.join(''), { htmlContent: true });

      return this.router.replaceWith('authenticated.target-profiles.target-profile.organizations');
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  @action
  async attachOrganizationsFromExistingTargetProfile(e) {
    e.preventDefault();
    if (this.isDisabledAttachOrganizationsFromExistingTargetProfile) return;

    const targetProfile = this.args.targetProfile;
    try {
      await targetProfile.attachOrganizationsFromExistingTargetProfile({
        'target-profile-id': this.existingTargetProfile,
      });
      this.existingTargetProfile = '';
      await this.notifications.success('Organisation(s) rattaché(es) avec succès.');
      return this.router.replaceWith('authenticated.target-profiles.target-profile.organizations');
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

  _getUniqueOrganizations() {
    const targetProfileIds = this.organizationsToAttach
      .split(',')
      .map((targetProfileId) => parseInt(targetProfileId.trim()));
    return uniq(targetProfileIds);
  }
}
