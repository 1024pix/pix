import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import uniq from 'lodash/uniq';
import { tracked } from '@glimmer/tracking';

export default class Organizations extends Component {
  @service store;
  @service notifications;
  @service router;

  @tracked organizationsToAttach = [];
  @tracked existingTargetProfile = null;

  @action
  async attachOrganizations(e) {
    e.preventDefault();
    const targetProfile = this.args.targetProfile;
    try {
      await targetProfile.attachOrganizations({ 'organization-ids': this._getUniqueOrganizations() });
      this.organizationsToAttach = null;
      await this.notifications.success('Organisation(s) rattaché(es) avec succès.');
      return this.router.replaceWith('authenticated.target-profiles.target-profile.organizations');
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  @action
  async attachOrganizationsFromExistingTargetProfile(e) {
    e.preventDefault();
    const targetProfile = this.args.targetProfile;
    try {
      await targetProfile.attachOrganizationsFromExistingTargetProfile({ 'target-profile-id': this.existingTargetProfile });
      this.existingTargetProfile = null;
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
    const targetProfileIds = this.organizationsToAttach.split(',').map((targetProfileId) => parseInt(targetProfileId.trim()));
    return uniq(targetProfileIds);
  }
}
