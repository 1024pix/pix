import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSegmentedControl from '@1024pix/pix-ui/components/pix-segmented-control';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class LearnersFilterBanner extends Component {
  @service intl;
  @service router;

  @tracked organizationExternalId = this.router.currentRoute?.queryParams.organizationExternalId;
  @tracked fullName = this.router.currentRoute?.queryParams.fullName;
  @tracked hideDisabled = this.router.currentRoute?.queryParams.hideDisabled;

  @action
  onChangeOrganizationExternalId(event) {
    this.organizationExternalId = event.target.value === '' ? undefined : event.target.value;
  }

  @action
  onChangeFullName(event) {
    this.fullName = event.target.value === '' ? undefined : event.target.value;
  }

  @action
  onChangeHideDisabled() {
    this.hideDisabled = this.hideDisabled === true ? undefined : true;
    this.refreshLearnersList();
  }

  @action
  clearSearchFields() {
    this.organizationExternalId = undefined;
    this.fullName = undefined;
    this.refreshLearnersList();
  }

  @action
  refreshLearnersList() {
    this.router.transitionTo({
      queryParams: {
        organizationExternalId: this.organizationExternalId,
        fullName: this.fullName,
        hideDisabled: this.hideDisabled,
        organizationSort: undefined,
        birthdateSort: undefined,
        updatedAtSort: undefined,
        pageNumber: undefined,
      },
    });
  }

  <template>
    <PixFilterBanner
      @title={{t "common.filters.title"}}
      @clearFiltersLabel={{t "common.filters.actions.clear"}}
      @onClearFilters={{this.clearSearchFields}}
      @onLoadFilters={{this.refreshLearnersList}}
      @loadFiltersLabel={{t "common.filters.actions.load"}}
    >

      <PixInput @id="fullName" {{on "change" this.onChangeFullName}} @value={{this.fullName}} @size="small">
        <:label>Prénom/Nom</:label>
      </PixInput>

      <PixInput
        @id="organizationExternalId"
        {{on "change" this.onChangeOrganizationExternalId}}
        @value={{this.organizationExternalId}}
        @size="small"
      >
        <:label>Orga ID Externe</:label>
      </PixInput>

      <PixSegmentedControl @onChange={{this.onChangeHideDisabled}} @toggled={{this.hideDisabled}}>
        <:label>Masquer les prescrits désactivés</:label>
        <:viewA>Non</:viewA>
        <:viewB>Oui</:viewB>
      </PixSegmentedControl>
    </PixFilterBanner>
  </template>
}
