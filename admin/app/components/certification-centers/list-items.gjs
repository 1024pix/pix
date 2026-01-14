import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixSegmentedControl from '@1024pix/pix-ui/components/pix-segmented-control';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class CertificationCenterListItems extends Component {
  get isClearFiltersButtonDisabled() {
    return !this.args.id && !this.args.name && !this.args.type && !this.args.externalId && !this.args.hideArchived;
  }

  @action
  filterHideArchived(value) {
    const event = { target: { value } };
    this.args.triggerFiltering('hideArchived', event);
  }

  <template>
    <div class="certification-centers-list">
      <PixFilterBanner
        @title={{t "common.filters.title"}}
        @clearFiltersLabel={{t "common.filters.actions.clear"}}
        @isClearFilterButtonDisabled={{this.isClearFiltersButtonDisabled}}
        @onClearFilters={{@onResetFilter}}
      >
        <PixInput value={{@id}} oninput={{fn @triggerFiltering "id"}} type="number">
          <:label>Identifiant</:label>
        </PixInput>
        <PixInput value={{@name}} oninput={{fn @triggerFiltering "name"}}>
          <:label>Nom</:label>
        </PixInput>
        <PixInput value={{@type}} oninput={{fn @triggerFiltering "type"}}>
          <:label>Type</:label>
        </PixInput>
        <PixInput value={{@externalId}} oninput={{fn @triggerFiltering "externalId"}}>
          <:label>ID externe</:label>
        </PixInput>
        <PixSegmentedControl @onChange={{this.filterHideArchived}} @toggled={{@hideArchived}}>
          <:label>Masquer les centres archivés</:label>
          <:viewA>Oui</:viewA>
          <:viewB>Non</:viewB>
        </PixSegmentedControl>
      </PixFilterBanner>

      {{#if @certificationCenters}}
        <PixTable
          @variant="admin"
          @caption={{t "components.certification-centers.list-items.table.caption"}}
          @data={{@certificationCenters}}
        >
          <:columns as |certificationCenter context|>
            <PixTableColumn @context={{context}}>
              <:header>
                ID
              </:header>
              <:cell>
                <LinkTo @route="authenticated.certification-centers.get" @model={{certificationCenter.id}}>
                  {{certificationCenter.id}}
                </LinkTo>
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="break-word">
              <:header>
                Nom
              </:header>
              <:cell>
                {{certificationCenter.name}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Type
              </:header>
              <:cell>
                {{certificationCenter.type}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="break-word">
              <:header>
                ID externe
              </:header>
              <:cell>
                {{certificationCenter.externalId}}
              </:cell>
            </PixTableColumn>
          </:columns>
        </PixTable>

        <PixPagination @pagination={{@certificationCenters.meta}} />
      {{else}}
        <div class="table__empty">{{t "common.tables.empty-result"}}</div>
      {{/if}}
    </div>
  </template>
}
