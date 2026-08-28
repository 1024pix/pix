import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import PaginationWrapper from 'pix-admin/components/ui/pagination-wrapper';

export default class NetworkListItems extends Component {
  get isClearFiltersButtonDisabled() {
    return !this.args.name;
  }

  <template>
    <PixFilterBanner
      @title={{t "common.filters.title"}}
      @onClearFilters={{@onResetFilter}}
      @clearFiltersLabel={{t "common.filters.actions.clear"}}
      @isClearFilterButtonDisabled={{this.isClearFiltersButtonDisabled}}
    >
      <PixInput value={{@name}} oninput={{fn @triggerFiltering "name"}}>
        <:label>{{t "components.networks.list.filters.name"}}</:label>
      </PixInput>
    </PixFilterBanner>

    {{#if @networks}}
      <PixTable @variant="admin" @caption={{t "components.networks.list.table.caption"}} @data={{@networks}}>
        <:columns as |network context|>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "common.fields.id"}}
            </:header>
            <:cell>
              <LinkTo @route="authenticated.networks.get" @model={{network.id}}>
                {{network.id}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              {{t "common.fields.name"}}
            </:header>
            <:cell>
              {{network.name}}
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
      <PaginationWrapper @pagination={{@networks.meta}} />
    {{else}}
      <div class="table__empty">{{t "common.tables.empty-result"}}</div>
    {{/if}}
  </template>
}
