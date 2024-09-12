import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import pick from 'ember-composable-helpers/helpers/pick';
import { t } from 'ember-intl';
import set from 'ember-set-helper/helpers/set';
import uniq from 'lodash/uniq';

import ListItems from '../organizations/list-items';

export default class Organizations extends Component {
  @service store;
  @service notifications;
  @service router;
  @service currentUser;
  @service intl;

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
    const adapter = this.store.adapterFor('target-profile');
    try {
      const response = await adapter.attachOrganizations({
        organizationIds: this._getUniqueOrganizations(),
        targetProfileId: targetProfile.id,
      });

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
      await this.notifications.success('Organisation(s) rattaché(es) avec succès.');
      return this.router.replaceWith('authenticated.target-profiles.target-profile.organizations');
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  _handleResponseError({ errors }) {
    const genericErrorMessage = this.intl.t('common.notifications.generic-error');

    if (!errors) {
      return this.notifications.error(genericErrorMessage);
    }
    errors.forEach((error) => {
      if (['404', '412'].includes(error.status)) {
        return this.notifications.error(error.detail);
      }
      return this.notifications.error(genericErrorMessage);
    });
  }

  _getUniqueOrganizations() {
    const targetProfileIds = this.organizationsToAttach
      .split(',')
      .map((targetProfileId) => parseInt(targetProfileId.trim()));
    return uniq(targetProfileIds);
  }

  <template>
    <section class="page-section target-profile-organizations">
      <div class="organization__forms-section">
        <form class="organization__form" {{on "submit" this.attachOrganizations}}>
          <label for="attach-organizations">Rattacher une ou plusieurs organisation(s)</label>
          <div class="organization__sub-form">
            <PixInput
              id="attach-organizations"
              @value={{this.organizationsToAttach}}
              class="form-field__text form-control"
              placeholder="1, 2"
              aria-describedby="attach-organizations-info"
              {{on "input" (pick "target.value" (set this "organizationsToAttach"))}}
            />
            <p id="attach-organizations-info" hidden>Ids des organisations, séparés par une virgule</p>
            <PixButton
              @type="submit"
              @size="small"
              aria-label="Valider le rattachement"
              @isDisabled={{this.isDisabledAttachOrganizations}}
            >
              {{t "common.actions.validate"}}
            </PixButton>
          </div>
        </form>

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
              {{on "input" (pick "target.value" (set this "existingTargetProfile"))}}
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
    <section class="page-section">
      <header class="page-section__header">
        <h2 class="page-section__title">Organisations</h2>
      </header>

      <ListItems
        @organizations={{@organizations}}
        @id={{@id}}
        @name={{@name}}
        @type={{@type}}
        @externalId={{@externalId}}
        @triggerFiltering={{@triggerFiltering}}
        @goToOrganizationPage={{@goToOrganizationPage}}
        @detachOrganizations={{@detachOrganizations}}
        @targetProfileName={{@targetProfile.name}}
        @showDetachColumn={{this.isSuperAdminOrMetier}}
      />
    </section>
  </template>
}
