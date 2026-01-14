import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixSegmentedControl from '@1024pix/pix-ui/components/pix-segmented-control';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class ActionsOnUsersRoleInOrganization extends Component {
  @tracked showModal = false;
  @tracked organizationToDetach;

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
  filterType(value) {
    const event = { target: { value } };
    this.args.triggerFiltering('type', event);
  }

  @action
  filterAdministrationTeam(value) {
    const event = { target: { value } };
    this.args.triggerFiltering('administrationTeamId', event);
  }

  @action
  filterHideArchived(value) {
    const event = { target: { value } };
    this.args.triggerFiltering('hideArchived', event);
  }

  get optionAdministrationTeam() {
    return this.args.administrationTeams.map((team) => ({
      value: team.id,
      label: team.name,
    }));
  }

  get isClearFiltersButtonDisabled() {
    return (
      !this.args.id &&
      !this.args.name &&
      !this.args.type &&
      !this.args.externalId &&
      !this.args.hideArchived &&
      !this.args.administrationTeamId
    );
  }

  <template>
    <PixFilterBanner
      @title={{t "common.filters.title"}}
      @onClearFilters={{@onResetFilter}}
      @clearFiltersLabel={{t "common.filters.actions.clear"}}
      @isClearFilterButtonDisabled={{this.isClearFiltersButtonDisabled}}
    >
      <PixInput value={{@id}} oninput={{fn @triggerFiltering "id"}} type="number" min="1">
        <:label>Identifiant</:label>
      </PixInput>
      <PixInput value={{@name}} oninput={{fn @triggerFiltering "name"}}>
        <:label>Nom</:label>
      </PixInput>
      <PixSelect
        @id="type"
        @hideDefaultOption={{true}}
        @options={{this.optionType}}
        @onChange={{this.filterType}}
        @value={{@type}}
      >
        <:label>Type</:label>
      </PixSelect>
      <PixSelect
        @id="administrationTeam"
        @hideDefaultOption={{true}}
        @options={{this.optionAdministrationTeam}}
        @onChange={{this.filterAdministrationTeam}}
        @value={{@administrationTeamId}}
      >
        <:label>{{t "components.organizations.list-items.table.header.administration-team-name"}}</:label>
      </PixSelect>
      <PixInput value={{@externalId}} oninput={{fn @triggerFiltering "externalId"}}>
        <:label>Identifiant externe</:label>
      </PixInput>
      <PixSegmentedControl @onChange={{this.filterHideArchived}} @toggled={{@hideArchived}}>
        <:label>Masquer les organisations archivées</:label>
        <:viewA>Oui</:viewA>
        <:viewB>Non</:viewB>
      </PixSegmentedControl>
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
              {{organization.name}}
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
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.organizations.list-items.table.header.administration-team-name"}}
            </:header>
            <:cell>
              {{organization.administrationTeamName}}
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
