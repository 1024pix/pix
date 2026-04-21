import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { debounceTask } from 'ember-lifeline';
import uniq from 'lodash/uniq';
import AttachOrganizationsForm from 'pix-admin/components/organizations/attach-organizations-form';
import config from 'pix-admin/config/environment';

import ListItems from '../organizations/list-items';

export default class Organizations extends Component {
  @service store;
  @service pixToast;
  @service router;
  @service currentUser;
  @service intl;

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
  goToOrganizationPage(organizationId) {
    this.router.transitionTo('authenticated.organizations.get', organizationId);
  }

  @action
  onOrganizationsToAttachChange(event) {
    this.organizationsToAttach = event.target.value;
  }

  @action
  onExistingTargetProfileChange(event) {
    this.existingTargetProfile = event.target.value;
  }

  @action
  async attachOrganizations(organizationsToAttach) {
    const targetProfile = this.args.targetProfile;
    const adapter = this.store.adapterFor('target-profile');
    try {
      const response = await adapter.attachOrganizations({
        organizationIds: organizationsToAttach,
        targetProfileId: targetProfile.id,
      });

      const { 'attached-ids': attachedIds, 'duplicated-ids': duplicatedIds } = response.data.attributes;

      return { attachedIds, duplicatedIds };
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  @action
  async reloadCurrentPage() {
    return this.router.replaceWith('authenticated.target-profiles.target-profile.organizations');
  }

  @action
  async organizationsFromExistingTargetProfileToAttach(e) {
    e.preventDefault();
    if (this.isDisabledAttachOrganizationsFromExistingTargetProfile) return;

    const targetProfile = this.args.targetProfile;
    const adapter = this.store.adapterFor('target-profile');
    try {
      await adapter.attachOrganizationsFromExistingTargetProfile({
        targetProfileId: targetProfile.id,
        targetProfileIdToCopy: this.existingTargetProfile,
      });
      this.existingTargetProfile = '';
      await this.pixToast.sendSuccessNotification({ message: 'Organisation(s) rattaché(es) avec succès.' });
      return this.router.refresh();
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  @action
  async detachOrganizations(organizationId) {
    const adapter = this.store.adapterFor('target-profile');

    try {
      const detachedOrganizationIds = await adapter.detachOrganizations(this.args.targetProfile.id, [organizationId]);
      const hasDetachedOrganizations = detachedOrganizationIds.length > 0;

      if (hasDetachedOrganizations) {
        const message = 'Organisation(s) détachée(s) avec succès : ' + detachedOrganizationIds.join(', ');
        await this.pixToast.sendSuccessNotification({ message });
        this.router.refresh();
      }
    } catch {
      return this.pixToast.sendErrorNotification({ message: 'Une erreur est survenue.' });
    }
  }

  _handleResponseError({ errors }) {
    const genericErrorMessage = this.intl.t('common.notifications.generic-error');

    if (!errors) {
      return this.pixToast.sendErrorNotification({ message: genericErrorMessage });
    }
    errors.forEach((error) => {
      if (['404', '412'].includes(error.status)) {
        return this.pixToast.sendErrorNotification({ message: error.detail });
      }
      return this.pixToast.sendErrorNotification({ message: genericErrorMessage });
    });
  }

  _getUniqueOrganizations() {
    const targetProfileIds = this.organizationsToAttach
      .split(',')
      .map((targetProfileId) => parseInt(targetProfileId.trim()));
    return uniq(targetProfileIds);
  }

  updateQueryParams({ param, value }) {
    this.router.transitionTo({
      queryParams: { [param]: value },
    });
  }

  @action
  triggerFiltering(fieldName, event) {
    debounceTask(
      this,
      'updateQueryParams',
      { param: fieldName, value: event.target.value },
      config.pagination.debounce,
    );
  }

  @action
  onResetFilter() {
    this.router.transitionTo({
      queryParams: {
        id: null,
        name: null,
        type: null,
        externalId: null,
        hideArchived: null,
        administrationTeamId: null,
      },
    });
  }

  <template>
    <section class="page-section target-profile-organizations">
      <div class="organization__forms-section">
        <AttachOrganizationsForm
          @attachOrganizations={{this.attachOrganizations}}
          @reloadAfterSuccess={{this.reloadCurrentPage}}
        />

        <form class="organization__form" {{on "submit" this.organizationsFromExistingTargetProfileToAttach}}>
          <label for="attach-organizations-from-existing-target-profile">Rattacher les organisations d'un profil cible
            existant</label>
          <div class="organization__sub-form">
            <PixInput
              id="attach-organizations-from-existing-target-profile"
              @value={{this.existingTargetProfile}}
              class="form-field__text form-control"
              placeholder="1135"
              aria-describedby="attach-organizations-from-existing-target-profile-info"
              {{on "input" this.onExistingTargetProfileChange}}
            />
            <p id="attach-organizations-from-existing-target-profile-info" hidden>Id du profil cible existant</p>
            <PixButton
              @type="submit"
              @size="small"
              aria-label="Valider le rattachement à partir de ce profil cible"
              @isDisabled={{this.isDisabledAttachOrganizationsFromExistingTargetProfile}}
            >
              {{t "common.actions.validate"}}
            </PixButton>
          </div>
        </form>
      </div>
    </section>
    <section class="page-section organizations-list">
      <header class="header page-section__header">
        <h2 class="page-section__title">Organisations</h2>
      </header>

      <ListItems
        @organizations={{@organizations}}
        @administrationTeams={{@administrationTeams}}
        @id={{@id}}
        @name={{@name}}
        @type={{@type}}
        @externalId={{@externalId}}
        @triggerFiltering={{this.triggerFiltering}}
        @goToOrganizationPage={{this.goToOrganizationPage}}
        @detachOrganizations={{this.detachOrganizations}}
        @entityName={{@targetProfile.internalName}}
        @confirmationLabel="components.target-profiles.organizations.detach-organization"
        @hideArchived={{@hideArchived}}
        @showDetachColumn={{this.isSuperAdminOrMetier}}
        @administrationTeamId={{@administrationTeamId}}
        @onResetFilter={{this.onResetFilter}}
      />
    </section>
  </template>
}
