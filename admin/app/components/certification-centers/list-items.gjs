import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class CertificationCenterListItems extends Component {
  searchedId = this.args.id;
  searchedName = this.args.name;
  searchedType = this.args.type;
  searchedExternalId = this.args.externalId;

  <template>
    <div class="certification-centers-list">
      <PixFilterBanner @title={{t "common.filters.title"}}>
        <PixInput value={{this.searchedId}} oninput={{fn @triggerFiltering "id"}}>
          <:label>Identifiant</:label>
        </PixInput>
        <PixInput value={{this.searchedName}} oninput={{fn @triggerFiltering "name"}}>
          <:label>Nom</:label>
        </PixInput>
        <PixInput value={{this.searchedType}} oninput={{fn @triggerFiltering "type"}}>
          <:label>Type</:label>
        </PixInput>
        <PixInput value={{this.searchedExternalId}} oninput={{fn @triggerFiltering "externalId"}}>
          <:label>ID externe</:label>
        </PixInput>
      </PixFilterBanner>

      {{#if @certificationCenters}}
        <PixTable
          @variant="admin"
          @caption={{t "components.certification-centers.list-items.table.caption"}}
          @data={{@certificationCenters}}
        >
          <:columns as |certificationCenter context|>
            <PixTableColumn @context={{context}}>
              <:header>
                ID
              </:header>
              <:cell>
                <LinkTo @route="authenticated.certification-centers.get" @model={{certificationCenter.id}}>
                  {{certificationCenter.id}}
                </LinkTo>
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="break-word">
              <:header>
                Nom
              </:header>
              <:cell>
                <LinkTo @route="authenticated.certification-centers.get" @model={{certificationCenter.id}}>
                  {{certificationCenter.name}}
                </LinkTo>
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Type
              </:header>
              <:cell>
                {{certificationCenter.type}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="break-word">
              <:header>
                ID externe
              </:header>
              <:cell>
                {{certificationCenter.externalId}}
              </:cell>
            </PixTableColumn>
          </:columns>
        </PixTable>

        <PixPagination @pagination={{@certificationCenters.meta}} />
      {{else}}
        <div class="table__empty">{{t "common.tables.empty-result"}}</div>
      {{/if}}
    </div>
  </template>
}
