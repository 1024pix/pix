import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import formatDate from '../../helpers/format-date';
import { categories } from '../../helpers/target-profile-categories.js';

export default class TargetProfileListSummaryItems extends Component {
  @service intl;
  @tracked selectedValues = [];

  get isClearFiltersButtonDisabled() {
    return !this.args.id && !this.args.name && this.args.categories?.length === 0;
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
        placeholder={{t "pages.target-profiles.filters.search-by-id.placeholder"}}
        @screenReaderOnly={{true}}
      >
        <:label>{{t "pages.target-profiles.filters.search-by-id.name"}}</:label>
      </PixInput>

      <PixInput
        type="text"
        value={{@name}}
        placeholder={{t "pages.target-profiles.filters.search-by-name.placeholder"}}
        oninput={{fn @triggerFiltering "name"}}
        @screenReaderOnly={{true}}
      >
        <:label>{{t "pages.target-profiles.filters.search-by-name.name"}}</:label>
      </PixInput>
      <PixMultiSelect
        @id="categories"
        @screenReaderOnly={{true}}
        @placeholder={{t "common.filters.target-profile.placeholder"}}
        @onChange={{this.triggerCategoriesFiltering}}
        @values={{@categories}}
        @options={{this.categoryOptions}}
      >
        <:label>{{t "common.filters.target-profile.label"}}</:label>
        <:default as |option|>{{option.label}}</:default>
      </PixMultiSelect>

    </PixFilterBanner>

    <div class="content-text content-text--small">
      <div class="table-admin">
        <table>
          <thead>
            <tr>
              <th class="table__column table__column--id">{{t "common.fields.id"}}</th>
              <th>{{t "common.fields.name"}}</th>
              <th>{{t "common.fields.target-profile.category.name"}}</th>
              <th class="col-date">{{t "common.fields.createdAt"}}</th>
              <th class="col-status">{{t "common.fields.status"}}</th>
            </tr>
          </thead>

          {{#if @summaries}}
            <tbody>
              {{#each @summaries as |summary|}}
                <tr aria-label="Profil cible">
                  <td class="table__column table__column--id">{{summary.id}}</td>
                  <td>
                    <LinkTo @route="authenticated.target-profiles.target-profile" @model={{summary.id}}>
                      {{summary.name}}
                    </LinkTo>
                  </td>
                  <td class="table__column table__column--id">{{t summary.translationKeyCategory}}</td>
                  <td class="table__column">{{formatDate summary.createdAt}}</td>
                  <td class="target-profile-table-column__status">
                    {{if summary.outdated "Obsolète" "Actif"}}
                  </td>
                </tr>
              {{/each}}
            </tbody>
          {{/if}}
        </table>

        {{#unless @summaries}}
          <div class="table__empty">Aucun résultat</div>
        {{/unless}}
      </div>
    </div>

    {{#if @summaries}}
      <PixPagination @pagination={{@summaries.meta}} />
    {{/if}}
  </template>
}
