import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixToggleButton from '@1024pix/pix-ui/components/pix-toggle-button';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';

export default class ActionsOnUsersRoleInOrganization extends Component {
  @tracked showModal = false;
  @tracked organizationToDetach;

  searchedId = this.args.id;
  searchedName = this.args.name;
  searchedExternalId = this.args.externalId;

  optionType = [
    { value: 'PRO', label: 'PRO' },
    { value: 'SCO', label: 'SCO' },
    { value: 'SCO-1D', label: 'SCO-1D' },
    { value: 'SUP', label: 'SUP' },
  ];

  @action
  openModal(organization) {
    this.showModal = true;
    this.organizationToDetach = organization;
  }

  @action
  closeModal() {
    this.showModal = false;
    this.organizationToDetach = null;
  }

  @action
  async detachOrganizations(organizationId) {
    await this.args.detachOrganizations(organizationId);
    this.closeModal();
  }

  @action
  filter(value) {
    const event = { target: { value } };
    this.args.triggerFiltering('type', event);
  }

  <template>
    <PixFilterBanner @title={{t "common.filters.title"}}>
      <PixInput value={{this.searchedId}} oninput={{fn @triggerFiltering "id"}}>
        <:label>Identifiant</:label>
      </PixInput>
      <PixInput value={{this.searchedName}} oninput={{fn @triggerFiltering "name"}}>
        <:label>Nom</:label>
      </PixInput>
      <PixSelect
        @id="type"
        @hideDefaultOption={{true}}
        @options={{this.optionType}}
        @onChange={{this.filter}}
        @value={{@type}}
      >
        <:label>Type</:label>
      </PixSelect>
      <PixInput value={{this.searchedExternalId}} oninput={{fn @triggerFiltering "externalId"}}>
        <:label>Identifiant externe</:label>
      </PixInput>
      <PixToggleButton @onChange={{@toggleArchived}} @toggled={{@hideArchived}}>
        <:label>Masquer les organisations archivées</:label>
        <:viewA>Oui</:viewA>
        <:viewB>Non</:viewB>
      </PixToggleButton>
    </PixFilterBanner>

    {{#if @organizations}}
      <PixTable
        @variant="admin"
        @caption={{t "components.organizations.list-items.table.caption"}}
        @data={{@organizations}}
      >
        <:columns as |organization context|>
          <PixTableColumn @context={{context}}>
            <:header>
              ID
            </:header>
            <:cell>
              <LinkTo @route="authenticated.organizations.get" @model={{organization.id}}>
                {{organization.id}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              Nom
            </:header>
            <:cell>
              <LinkTo @route="authenticated.organizations.get" @model={{organization.id}}>{{organization.name}}</LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              Type
            </:header>
            <:cell>
              {{organization.type}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              Identifiant externe
            </:header>
            <:cell>
              {{organization.externalId}}
            </:cell>
          </PixTableColumn>
          {{#if @showDetachColumn}}
            <PixTableColumn @context={{context}}>
              <:header>
                Actions
              </:header>
              <:cell>
                <PixButton @variant="error" @size="small" @triggerAction={{fn this.openModal organization}}>
                  Détacher
                </PixButton>
              </:cell>
            </PixTableColumn>
          {{/if}}
        </:columns>
      </PixTable>

      <PixPagination @pagination={{@organizations.meta}} />
    {{else}}
      <div class="table__empty">{{t "common.tables.empty-result"}}</div>
    {{/if}}

    <PixModal
      @title="Détacher l'organisation du profil cible"
      @onCloseButtonClick={{this.closeModal}}
      @showModal={{this.showModal}}
      aria-hidden="{{not this.showModal}}"
    >
      <:content>
        <p>
          Etes-vous sûr de vouloir détacher l'organisation
          <strong>{{this.organizationToDetach.name}}</strong>
          du profil cible
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
          @triggerAction={{fn this.detachOrganizations this.organizationToDetach.id}}
        >Confirmer</PixButton>
      </:footer>
    </PixModal>
  </template>
}
