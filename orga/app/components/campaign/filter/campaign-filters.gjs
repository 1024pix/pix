import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixToggle from '@1024pix/pix-ui/components/pix-toggle';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import SearchInputFilter from '../../ui/search-input-filter';

export default class CampaignFilters extends Component {
  get isToggleSwitched() {
    return this.args.statusFilter !== 'archived';
  }

  get isClearFiltersButtonDisabled() {
    return (
      !this.args.nameFilter &&
      !this.args.statusFilter &&
      (this.args.listOnlyCampaignsOfCurrentUser || !this.args.ownerNameFilter)
    );
  }

  @action
  onToggle() {
    const status = this.isToggleSwitched ? 'archived' : null;
    this.args.onFilter('status', status);
  }

  <template>
    <PixFilterBanner
      @title={{t "common.filters.title"}}
      class="participant-filter-banner hide-on-mobile"
      aria-label={{t "pages.campaigns-list.filter.legend"}}
      @details={{t "pages.campaigns-list.filter.results" total=@numResults}}
      @clearFiltersLabel={{t "common.filters.actions.clear"}}
      @isClearFilterButtonDisabled={{this.isClearFiltersButtonDisabled}}
      @onClearFilters={{@onClearFilters}}
    >
      <SearchInputFilter
        @field="name"
        @value={{@nameFilter}}
        @placeholder={{t "pages.campaigns-list.filter.by-name"}}
        @label={{t "pages.campaigns-list.filter.by-name"}}
        @triggerFiltering={{@onFilter}}
      />
      {{#unless @listOnlyCampaignsOfCurrentUser}}
        <SearchInputFilter
          @field="ownerName"
          @value={{@ownerNameFilter}}
          @placeholder={{t "pages.campaigns-list.filter.by-owner"}}
          @label={{t "pages.campaigns-list.filter.by-owner"}}
          @triggerFiltering={{@onFilter}}
        />
      {{/unless}}

      <PixToggle
        @onLabel={{t "pages.campaigns-list.action.campaign.ongoing"}}
        @offLabel={{t "pages.campaigns-list.action.campaign.archived"}}
        @toggled={{this.isToggleSwitched}}
        @onChange={{this.onToggle}}
        @screenReaderOnly={{true}}
      >
        <:label>{{t "pages.campaigns-list.action.campaign.label"}}</:label>
      </PixToggle>
    </PixFilterBanner>
  </template>
}
