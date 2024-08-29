import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import { fn } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import formatDate from '../../helpers/format-date';

export default class TargetProfileListSummaryItems extends Component {
  searchedId = this.args.id;
  searchedName = this.args.name;

  <template>
    <div class="content-text content-text--small">
      <div class="table-admin">
        <table>
          <caption class="screen-reader-only">
            {{t "components.target-profiles.list-summary-items.table-caption"}}
          </caption>
          <thead>
            <tr>
              <th scope="col" id="target-profile-id" class="table__column--id">{{t
                  "components.target-profiles.list-summary-items.table-headers.target-profile-id"
                }}</th>
              <th scope="col" id="target-profile-name">{{t
                  "components.target-profiles.list-summary-items.table-headers.target-profile-name"
                }}</th>
              <th scope="col" id="target-profile-creation-date" class="table__column--medium">{{t
                  "components.target-profiles.list-summary-items.table-headers.target-profile-creation-date"
                }}</th>
              <th scope="col" id="target-profile-status" class="table__column--medium">{{t
                  "components.target-profiles.list-summary-items.table-headers.target-profile-status"
                }}</th>
            </tr>
            <tr>
              <td class="table__column--id">
                <PixInput
                  type="text"
                  value={{this.searchedId}}
                  oninput={{fn @triggerFiltering "id"}}
                  aria-label="Filtrer les profils cible par un id"
                />
              </td>
              <td>
                <PixInput
                  type="text"
                  value={{this.searchedName}}
                  oninput={{fn @triggerFiltering "name"}}
                  aria-label="Filtrer les profils cible par un nom"
                />
              </td>
              <td></td>
              <td></td>
            </tr>
          </thead>

          {{#if @summaries}}
            <tbody>
              {{#each @summaries as |summary|}}
                <tr aria-label="Profil cible">
                  <td headers="target-profile-id" class="table__column--id">{{summary.id}}</td>
                  <td headers="target-profile-name">
                    <LinkTo @route="authenticated.target-profiles.target-profile" @model={{summary.id}}>
                      {{summary.name}}
                    </LinkTo>
                  </td>
                  <td headers="target-profile-creation-date" class="table__column">{{formatDate summary.createdAt}}</td>
                  <td headers="target-profile-status">
                    {{if summary.outdated (t "common.words.obsolete") (t "common.words.active")}}
                  </td>
                </tr>
              {{/each}}
            </tbody>
          {{/if}}
        </table>

        {{#unless @summaries}}
          <div class="table__empty">{{t "common.tables.no-result"}}</div>
        {{/unless}}
      </div>
    </div>

    {{#if @summaries}}
      <PixPagination @pagination={{@summaries.meta}} />
    {{/if}}
  </template>
}
