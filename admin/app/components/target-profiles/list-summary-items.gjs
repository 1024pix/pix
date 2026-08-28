import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn, hash } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import PaginationWrapper from 'pix-admin/components/ui/pagination-wrapper';

import { categories } from '../../helpers/target-profile-categories.js';

export default class TargetProfileListSummaryItems extends Component {
  @service intl;
  @tracked selectedValues = [];

  get isClearFiltersButtonDisabled() {
    return !this.args.id && !this.args.internalName && this.args.categories?.length === 0;
  }

  get categoryOptions() {
    return Object.entries(categories).map(([key, value]) => ({ label: this.intl.t(value), value: key }));
  }

  @action
  triggerCategoriesFiltering(values) {
    this.args.triggerFiltering('categories', { target: { value: values } });
  }

  <template>
    <PixFilterBanner
      class="page-body-template__content"
      @title={{t "common.filters.title"}}
      aria-label={{t "pages.target-profiles.filters.aria-label"}}
      @details={{t "pages.target-profiles.filters.count" count=@summaries.meta.rowCount}}
      @clearFiltersLabel={{t "common.filters.actions.clear"}}
      @onClearFilters={{@onResetFilter}}
      @isClearFilterButtonDisabled={{this.isClearFiltersButtonDisabled}}
    >
      <PixInput
        type="text"
        value={{@id}}
        oninput={{fn @triggerFiltering "id"}}
        aria-label={{t "pages.target-profiles.filters.search-by-id.aria-label"}}
      >
        <:label>{{t "pages.target-profiles.filters.search-by-id.label"}}</:label>
      </PixInput>

      <PixInput
        type="text"
        value={{@internalName}}
        aria-label={{t "pages.target-profiles.filters.search-by-internal-name.aria-label"}}
        oninput={{fn @triggerFiltering "internalName"}}
      >
        <:label>{{t "pages.target-profiles.filters.search-by-internal-name.label"}}</:label>
      </PixInput>

      <PixMultiSelect
        @id="categories"
        @texts={{hash placeholder=(t "common.filters.target-profile.placeholder")}}
        @onChange={{this.triggerCategoriesFiltering}}
        @values={{@categories}}
        @options={{this.categoryOptions}}
      >
        <:label>{{t "common.filters.target-profile.label"}}</:label>
        <:default as |option|>{{option.label}}</:default>
      </PixMultiSelect>

    </PixFilterBanner>

    {{#if @summaries}}
      <PixTable
        @variant="admin"
        @data={{@summaries}}
        @caption={{t "components.target-profiles.list.table.caption"}}
        class="table"
      >
        <:columns as |summary context|>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "common.fields.id"}}
            </:header>
            <:cell>
              {{summary.id}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "common.fields.internalName"}}
            </:header>
            <:cell>
              <LinkTo @route="authenticated.target-profiles.target-profile" @model={{summary.id}}>
                {{summary.internalName}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "common.fields.target-profile.category.name"}}
            </:header>
            <:cell>
              {{t summary.translationKeyCategory}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "common.fields.createdAt"}}
            </:header>
            <:cell>
              {{formatDate summary.createdAt}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "common.fields.status"}}
            </:header>
            <:cell>
              {{if summary.outdated "Obsolète" "Actif"}}
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>

      <PaginationWrapper @pagination={{@summaries.meta}} />

    {{else}}
      <div class="table__empty">{{t "common.tables.empty-result"}}</div>
    {{/if}}
  </template>
}
