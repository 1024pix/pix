import { PixFilterBanner, PixSearchInput } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-orga/config/environment';

import MultiSelectFilter from '../ui/multi-select-filter';

export default class SupLearnerFilters extends Component {
  @service intl;

  get debounceTime() {
    return ENV.pagination.debounce;
  }

  get certificabilityOptions() {
    return [
      {
        value: 'not-available',
        label: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.not-available'),
      },
      {
        value: 'eligible',
        label: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible'),
      },
      {
        value: 'non-eligible',
        label: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.non-eligible'),
      },
    ];
  }

  get isClearFiltersButtonDisabled() {
    return (
      !this.args.searchFilter &&
      !this.args.studentNumberFilter &&
      this.args.groupsFilter.length === 0 &&
      this.args.certificabilityFilter.length === 0
    );
  }

  <template>
    <PixFilterBanner
      @title={{t "common.filters.title"}}
      class="participant-filter-banner hide-on-mobile"
      aria-label={{t "pages.sup-organization-participants.filter.aria-label"}}
      @details={{t "pages.sup-organization-participants.filter.students-count" count=@studentsCount}}
      @clearFiltersLabel={{t "common.filters.actions.clear"}}
      @onClearFilters={{@onResetFilter}}
      @isClearFilterButtonDisabled={{this.isClearFiltersButtonDisabled}}
    >
      <PixSearchInput
        @id="studentNumber"
        value={{@studentNumberFilter}}
        @screenReaderOnly={{true}}
        @placeholder={{t "pages.sup-organization-participants.filter.student-number.placeholder"}}
        @debounceTimeInMs={{this.debounceTime}}
        @triggerFiltering={{@onFilter}}
      >
        <:label>{{t "pages.sup-organization-participants.filter.student-number.label"}}</:label>
      </PixSearchInput>
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
      <MultiSelectFilter
        @field="groups"
        @label={{t "pages.sup-organization-participants.filter.group.label"}}
        @onSelect={{@onFilter}}
        @selectedOption={{@groupsFilter}}
        @isLoading={{@isLoadingGroups}}
        @options={{@groupsOptions}}
        @placeholder={{t "pages.sup-organization-participants.filter.group.placeholder"}}
        @emptyMessage={{t "pages.sup-organization-participants.filter.group.empty"}}
      />

      <MultiSelectFilter
        @field="certificability"
        @label={{t "pages.sup-organization-participants.filter.certificability.label"}}
        @onSelect={{@onFilter}}
        @selectedOption={{@certificabilityFilter}}
        @options={{this.certificabilityOptions}}
        @placeholder={{t "pages.sup-organization-participants.filter.certificability.placeholder"}}
        @emptyMessage=""
      />
    </PixFilterBanner>
  </template>
}
