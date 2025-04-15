import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixSearchInput from '@1024pix/pix-ui/components/pix-search-input';
import t from 'ember-intl/helpers/t';
import ActivityTable from 'pix-orga/components/mission/activity-table';
import DivisionsFilter from 'pix-orga/components/ui/divisions-filter';
<template>
  <PixFilterBanner
    @title={{t "common.filters.title"}}
    class="participant-filter-banner hide-on-mobile"
    aria-label={{t "pages.missions.mission.table.activities.filters.aria-label"}}
    @details={{t "pages.missions.mission.table.activities.filters.learners-count" count=@controller.learnersCount}}
    @clearFiltersLabel={{t "common.filters.actions.clear"}}
    @onClearFilters={{@controller.onResetFilter}}
    @isClearFilterButtonDisabled={{@controller.isClearFiltersButtonDisabled}}
  >
    <DivisionsFilter
      @model={{@model.organization}}
      @selected={{@controller.divisions}}
      @onSelect={{@controller.onSelectDivisions}}
    />
    <PixSearchInput
      @id="name"
      value={{@controller.name}}
      @screenReaderOnly={{true}}
      @placeholder={{t "common.filters.fullname.placeholder"}}
      @debounceTimeInMs={{@controller.debounceTime}}
      @triggerFiltering={{@controller.onFilter}}
    >
      <:label>{{t "common.filters.fullname.label"}}</:label>
    </PixSearchInput>
    <PixMultiSelect
      @options={{@controller.statusOptions}}
      @values={{@controller.statuses}}
      @placeholder={{t "pages.missions.mission.table.activities.filters.status.label"}}
      @onChange={{@controller.onSelectStatuses}}
      @isSearchable={{false}}
      @screenReaderOnly={{true}}
    >
      <:label>{{t "pages.missions.mission.table.activity.filters.status.label"}}</:label>
      <:default as |option|>{{option.label}}</:default>
    </PixMultiSelect>
  </PixFilterBanner>
  <ActivityTable
    @missionLearners={{@controller.model.missionLearners}}
    @mission={{@controller.model.mission.mission}}
  />
</template>
