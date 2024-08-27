import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import { fn } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';

export default class CertificationCenterListItems extends Component {
  searchedId = this.args.id;
  searchedName = this.args.name;
  searchedType = this.args.type;
  searchedExternalId = this.args.externalId;

  <template>
    <div class="content-text content-text--small">
      <table class="table-admin">
        <thead>
          <tr>
            <th class="table__column table__column--id"><label for="id">ID</label></th>
            <th><label for="name">Nom</label></th>
            <th><label for="type">Type</label></th>
            <th><label for="externalId">ID externe</label></th>
          </tr>
          <tr>
            <td class="table__column table__column--id">
              <PixInput id="id" type="text" value={{this.searchedId}} oninput={{fn @triggerFiltering "id"}} />
            </td>
            <td>
              <PixInput id="name" type="text" value={{this.searchedName}} oninput={{fn @triggerFiltering "name"}} />
            </td>
            <td>
              <PixInput id="type" type="text" value={{this.searchedType}} oninput={{fn @triggerFiltering "type"}} />
            </td>
            <td>
              <PixInput
                id="externalId"
                type="text"
                value={{this.searchedExternalId}}
                oninput={{fn @triggerFiltering "externalId"}}
              />
            </td>
          </tr>
        </thead>

        {{#if @certificationCenters}}
          <tbody>
            {{#each @certificationCenters as |certificationCenter|}}
              <tr aria-label="Centre de certification {{certificationCenter.name}}">
                <td class="table__column table__column--id">
                  <LinkTo @route="authenticated.certification-centers.get" @model={{certificationCenter.id}}>
                    {{certificationCenter.id}}
                  </LinkTo>
                </td>
                <td>{{certificationCenter.name}}</td>
                <td>{{certificationCenter.type}}</td>
                <td>{{certificationCenter.externalId}}</td>
              </tr>
            {{/each}}
          </tbody>
        {{/if}}
      </table>

      {{#unless @certificationCenters}}
        <div class="table__empty">Aucun résultat</div>
      {{/unless}}
    </div>

    {{#if @certificationCenters}}
      <PixPagination @pagination={{@certificationCenters.meta}} />
    {{/if}}
  </template>
}
