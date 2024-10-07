import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import { fn } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import formatDate from '../../helpers/format-date';

export default class TargetProfileListSummaryItems extends Component {
  get isClearFiltersButtonDisabled() {
    return !this.args.id && !this.args.name;
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
    </PixFilterBanner>

    <div class="content-text content-text--small">
      <div class="table-admin">
        <table>
          <thead>
            <tr>
              <th class="table__column table__column--id">{{t "common.fields.id"}}</th>
              <th>{{t "common.fields.name"}}</th>
              <th class="col-date">{{t "common.fields.createdAt"}}</th>
              <th class="col-status">{{t "common.fields.status"}}</th>
            </tr>
          </thead>

          {{#if @summaries}}
            <tbody>
              {{#each @summaries as |summary|}}
                <tr aria-label="Profil cible">
                  <td headers="target-profile-id" class="table__column table__column--id">{{summary.id}}</td>
                  <td headers="target-profile-name">
                    <LinkTo @route="authenticated.target-profiles.target-profile" @model={{summary.id}}>
                      {{summary.name}}
                    </LinkTo>
                  </td>
                  <td class="table__column">{{formatDate summary.createdAt}}</td>
                  <td headers="target-profile-status" class="target-profile-table-column__status">
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
