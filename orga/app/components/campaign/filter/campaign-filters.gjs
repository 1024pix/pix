import { PixFilterBanner, PixSearchInput, PixSegmentedControl } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'pix-orga/config/environment';

const debounceTime = ENV.pagination.debounce;

export default class CampaignFilters extends Component {
  get isToggleSwitched() {
    return this.args.statusFilter === 'archived';
  }

  get isClearFiltersButtonDisabled() {
    return (
      !this.args.nameFilter &&
      !this.args.statusFilter &&
      (this.args.listOnlyCampaignsOfCurrentUser || !this.args.ownerNameFilter)
    );
  }

  @action
  onToggle(value) {
    this.args.onFilter('status', value ? 'archived' : null);
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
      <PixSearchInput
        @id="name"
        value={{@nameFilter}}
        @screenReaderOnly={{true}}
        @placeholder={{t "pages.campaigns-list.filter.by-name"}}
        @debounceTimeInMs={{debounceTime}}
        @triggerFiltering={{@onFilter}}
      >
        <:label>{{t "pages.campaigns-list.filter.by-name"}}</:label>
      </PixSearchInput>
      {{#unless @listOnlyCampaignsOfCurrentUser}}
        <PixSearchInput
          @id="ownerName"
          value={{@ownerNameFilter}}
          @screenReaderOnly={{true}}
          @placeholder={{t "pages.campaigns-list.filter.by-owner"}}
          @debounceTimeInMs={{debounceTime}}
          @triggerFiltering={{@onFilter}}
        >
          <:label>{{t "pages.campaigns-list.filter.by-owner"}}</:label>
        </PixSearchInput>
      {{/unless}}

      <PixSegmentedControl
        @toggled={{this.isToggleSwitched}}
        @onChange={{this.onToggle}}
        @screenReaderOnly={{true}}
        @variant="orga"
      >
        <:label>{{t "pages.campaigns-list.action.campaign.label"}}</:label>
        <:viewA>{{t "pages.campaigns-list.action.campaign.ongoing"}}</:viewA>
        <:viewB>{{t "pages.campaigns-list.action.campaign.archived"}}</:viewB>
      </PixSegmentedControl>
    </PixFilterBanner>
  </template>
}
