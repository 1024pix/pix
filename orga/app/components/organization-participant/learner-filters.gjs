import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import { get } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import { getColumnName } from '../../helpers/import-format.js';
import UiMultiSelectFilter from '../ui/multi-select-filter';
import UiSearchInputFilter from '../ui/search-input-filter';

export default class LearnerFilters extends Component {
  @service intl;
  @service currentUser;

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
    return !this.args.fullName && this.args.certificabilityFilter.length === 0;
  }

  get learnerCountTranslation() {
    return this.currentUser.canAccessMissionsPage
      ? this.intl.t('pages.organization-participants.filters.students-count', { count: this.args.learnersCount })
      : this.intl.t('pages.organization-participants.filters.participations-count', { count: this.args.learnersCount });
  }

  <template>
    <PixFilterBanner
      @title={{t "common.filters.title"}}
      class="participant-filter-banner hide-on-mobile"
      aria-label={{t "pages.organization-participants.filters.aria-label"}}
      @details={{this.learnerCountTranslation}}
      @clearFiltersLabel={{t "common.filters.actions.clear"}}
      @onClearFilters={{@onResetFilter}}
      @isClearFilterButtonDisabled={{this.isClearFiltersButtonDisabled}}
    >
      <UiSearchInputFilter
        @field="fullName"
        @value={{@fullName}}
        @placeholder={{t "common.filters.fullname.placeholder"}}
        @label={{t "common.filters.fullname.label"}}
        @triggerFiltering={{@onTriggerFiltering}}
      />

      {{#unless this.currentUser.canAccessMissionsPage}}
        <UiMultiSelectFilter
          @field="certificability"
          @label={{t "pages.organization-participants.filters.type.certificability.label"}}
          @onSelect={{@onTriggerFiltering}}
          @selectedOption={{@certificabilityFilter}}
          @options={{this.certificabilityOptions}}
          @placeholder={{t "pages.organization-participants.filters.type.certificability.placeholder"}}
          @emptyMessage=""
        />
      {{/unless}}
      {{#each @customFilters as |customFilter|}}
        {{#let (t (getColumnName customFilter)) as |columnName|}}
          <UiSearchInputFilter
            @field="extraFilters.{{customFilter}}"
            @value={{get @customFiltersValues customFilter}}
            @placeholder={{columnName}}
            @label={{columnName}}
            @triggerFiltering={{@onTriggerFiltering}}
          />
        {{/let}}
      {{/each}}
    </PixFilterBanner>
  </template>
}
