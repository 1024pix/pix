import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import { fn } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';

import formatDate from '../../helpers/format-date';

export default class TargetProfileListSummaryItems extends Component {
  searchedId = this.args.id;
  searchedName = this.args.name;

  <template>
    <div class="content-text content-text--small">
      <div class="table-admin">
        <table>

          <thead>
            <tr>
              <th class="table__column table__column--id" id="target-profile-id">ID</th>
              <th id="target-profile-name">Nom</th>
              <th class="col-date">Date de création</th>
              <th class="col-status" id="target-profile-status">Statut</th>
            </tr>
            <tr>
              <td class="table__column table__column--id">
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
