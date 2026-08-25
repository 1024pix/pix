import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixSearchInput from '@1024pix/pix-ui/components/pix-search-input';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { formatDate, t } from 'ember-intl';
import MultiSelectFilter from 'pix-orga/components/ui/multi-select-filter';
import Pagination from 'pix-orga/components/ui/pagination';
import ENV from 'pix-orga/config/environment';

export default class AttestationList extends Component {
  @service intl;

  debounceTime = ENV.pagination.debounce;

  get statusesOptions() {
    return [
      { value: 'OBTAINED', label: this.intl.t('pages.attestations.table.filter.status.obtained') },
      { value: 'NOT_OBTAINED', label: this.intl.t('pages.attestations.table.filter.status.not-obtained') },
    ];
  }

  get shouldShowDivisions() {
    return this.args.divisionsOptions?.length > 0;
  }

  <template>
    <PixFilterBanner
      @title={{t "common.filters.title"}}
      class="participant-filter-banner hide-on-mobile"
      aria-label={{t "pages.attestations.table.filter.legend"}}
      @details={{t "pages.attestations.table.filter.results" total=@participantStatuses.meta.rowCount}}
      @clearFiltersLabel={{t "common.filters.actions.clear"}}
      @isClearFilterButtonDisabled={{this.isClearFiltersButtonDisabled}}
      @onClearFilters={{@clearFilters}}
    >
      <PixSearchInput
        @id="search"
        value={{@searchFilter}}
        @screenReaderOnly={{true}}
        @placeholder={{t "common.filters.fullname.placeholder"}}
        @debounceTimeInMs={{this.debounceTime}}
        @triggerFiltering={{@onFilter}}
      >
        <:label>{{t "common.filters.fullname.label"}}</:label>
      </PixSearchInput>
      {{#if this.shouldShowDivisions}}
        <MultiSelectFilter
          @field="divisions"
          @label={{t "pages.attestations.table.filter.divisions.label"}}
          @onSelect={{@onFilter}}
          @selectedOption={{@divisionsFilter}}
          @options={{@divisionsOptions}}
          @placeholder={{t "pages.attestations.table.filter.divisions.empty-option"}}
        />
      {{/if}}

      <MultiSelectFilter
        @field="statuses"
        @label={{t "pages.attestations.table.filter.status.label"}}
        @onSelect={{@onFilter}}
        @selectedOption={{@statusesFilter}}
        @options={{this.statusesOptions}}
        @placeholder={{t "pages.attestations.table.filter.status.empty-option"}}
      />
    </PixFilterBanner>

    <PixTable class="attestations-page__list" @variant="orga" @data={{@participantStatuses}}>
      <:columns as |participantStatus context|>
        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.attestations.table.column.last-name"}}
          </:header>
          <:cell>
            {{participantStatus.lastName}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.attestations.table.column.first-name"}}
          </:header>
          <:cell>
            {{participantStatus.firstName}}
          </:cell>
        </PixTableColumn>
        {{#if this.shouldShowDivisions}}
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.attestations.table.column.division"}}
            </:header>
            <:cell>
              {{participantStatus.division}}
            </:cell>
          </PixTableColumn>
        {{/if}}
        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.attestations.table.column.status"}}
          </:header>
          <:cell>
            {{#if participantStatus.obtainedAt}}
              <PixTag @color="green">
                {{t "pages.attestations.table.status.obtained" date=(formatDate participantStatus.obtainedAt)}}
              </PixTag>
            {{else}}
              <PixTag @color="yellow">
                {{t "pages.attestations.table.status.not-obtained"}}
              </PixTag>
            {{/if}}
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>

    <Pagination @pagination={{@participantStatuses.meta}} />
  </template>
}
