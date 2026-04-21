import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import uniq from 'lodash/uniq';

export default class OrganizationTargetProfilesSectionComponent extends Component {
  @tracked targetProfilesToAttach = '';
  @tracked showModal = false;
  @tracked targetProfileToDetach;

  @service accessControl;
  @service intl;
  @service pixToast;

  get isDisabled() {
    return this.targetProfilesToAttach === '';
  }

  get sortedTargetProfileSummaries() {
    return [...this.args.targetProfileSummaries].sort((a, b) => Number(a.id) - Number(b.id));
  }

  @action
  onTargetProfilesToAttachChange(event) {
    this.targetProfilesToAttach = event.target.value;
  }

  @action
  async attachTargetProfiles(e) {
    e.preventDefault();
    if (this.isDisabled) {
      return;
    }

    await this.args.onAttachTargetProfiles(this.getUniqueTargetProfileIds());
    this.targetProfilesToAttach = '';
  }

  @action
  async detachTargetProfile(targetProfileId) {
    await this.args.onDetachTargetProfile(targetProfileId);
    this.closeModal();
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

  getUniqueTargetProfileIds() {
    const targetProfileIds = this.targetProfilesToAttach.split(',').map((targetProfileId) => targetProfileId.trim());
    return uniq(targetProfileIds);
  }

  <template>
    {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
      <section class="page-section">
        <h2 class="page-section__title page-section__title--sub">Rattacher un ou plusieurs profil(s) cible(s)</h2>
        <div class="organization__forms-section">
          <form class="organization__sub-form form" {{on "submit" this.attachTargetProfiles}}>
            <PixInput
              aria-label="ID du ou des profil(s) cible(s)"
              @value={{this.targetProfilesToAttach}}
              class="organization-sub-form__input form-field__text form-control"
              placeholder="1, 2"
              {{on "input" this.onTargetProfilesToAttachChange}}
            />
            <PixButton @type="submit" @size="small" @isDisabled={{this.isDisabled}}>
              {{t "common.actions.validate"}}
            </PixButton>
          </form>
        </div>
      </section>
    {{/if}}

    <section class="page-section">
      <header class="header page-section__header">
        <h2 class="page-section__title">Profils cibles</h2>
      </header>
      {{#if @targetProfileSummaries}}
        <PixTable
          @variant="admin"
          @caption={{t "components.organizations.target-profiles-section.table.caption"}}
          @data={{this.sortedTargetProfileSummaries}}
        >
          <:columns as |summary context|>
            <PixTableColumn @context={{context}}>
              <:header>
                ID
              </:header>
              <:cell>
                {{summary.id}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="break-word">
              <:header>
                Nom interne du profil cible
              </:header>
              <:cell>
                <LinkTo @route="authenticated.target-profiles.target-profile" @model={{summary.id}}>
                  {{summary.internalName}}
                </LinkTo>
              </:cell>
            </PixTableColumn>
            {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
              <PixTableColumn @context={{context}}>
                <:header>
                  Actions
                </:header>
                <:cell>
                  <PixButton @variant="error" @size="small" @triggerAction={{fn this.openModal summary}}>
                    Détacher
                  </PixButton>
                </:cell>
              </PixTableColumn>
            {{/if}}
          </:columns>
        </PixTable>
      {{else}}
        <div class="table__empty">{{t "common.tables.empty-result"}}</div>
      {{/if}}
    </section>

    <PixModal
      @title="Détacher le profil cible de l'organisation"
      @onCloseButtonClick={{this.closeModal}}
      @showModal={{this.showModal}}
    >
      <:content>
        <p>
          Etes-vous sûr de vouloir détacher le profil cible
          <strong>{{this.targetProfileToDetach.name}}</strong>
          de l'organisation
          <strong>{{@targetProfileName}}</strong>
          ?
        </p>
      </:content>
      <:footer>
        <PixButton @variant="secondary" @triggerAction={{this.closeModal}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton
          @variant="error"
          @triggerAction={{fn this.detachTargetProfile this.targetProfileToDetach.id}}
        >Confirmer</PixButton>
      </:footer>
    </PixModal>
  </template>
}
