import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { trackedArray } from '@ember/reactive/collections';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import FilterBanner from 'pix-admin/components/sessions/filter-banner';

export default class ListItems extends Component {
  selectedSessionsRows = trackedArray();

  @action
  toggleRowSelection(sessionId) {
    const index = this.selectedSessionsRows.indexOf(sessionId);
    if (index === -1) {
      this.selectedSessionsRows.push(sessionId);
    } else {
      this.selectedSessionsRows.splice(index, 1);
    }
  }

  @action
  toggleAllRowsSelection() {
    const hasSelectedRows = this.hasSelectedRows;

    this.clearSelectedRows();
    if (!hasSelectedRows) {
      this.selectedSessionsRows.push(...this.args.sessions.map((s) => s.id));
    }
  }

  @action
  clearSelectedRows() {
    this.selectedSessionsRows.splice(0);
  }

  @action
  isRowSelected(id) {
    return this.selectedSessionsRows.includes(id);
  }

  get hasSelectedRows() {
    return this.selectedSessionsRows.length > 0;
  }

  get isIndeterminateSelection() {
    return this.hasSelectedRows && this.selectedSessionsRows.length !== this.args.sessions.length;
  }

  <template>
    <div class="session-list">
      <FilterBanner @filters={{@filters}} @triggerFiltering={{@triggerFiltering}} @onChangeFilter={{@onChangeFilter}} />

      {{#if this.selectedSessionsRows.length}}
        <ul class="session-list__selected-rows">
          {{#each this.selectedSessionsRows as |selectedSessionId|}}
            <li>
              <PixTag @displayRemoveButton={{true}} @onRemove={{fn this.toggleRowSelection selectedSessionId}}>
                {{selectedSessionId}}
              </PixTag>
            </li>
          {{/each}}
        </ul>
      {{/if}}

      <div class="session-list__selected-rows-actions">
        <PixTooltip @isInline={{true}}>
          <:triggerElement>
            <PixCheckbox
              {{on "change" this.toggleAllRowsSelection}}
              @checked={{this.hasSelectedRows}}
              @isIndeterminate={{this.isIndeterminateSelection}}
              @screenReaderOnly={{true}}
              @size="small"
            >
              <:label>{{t "pages.sessions.table.actions.select-all.label"}}</:label>
            </PixCheckbox>
          </:triggerElement>
          <:tooltip>
            {{#if this.hasSelectedRows}}
              {{t "pages.sessions.table.actions.select-all.tooltip.deselect"}}
            {{else}}
              {{t "pages.sessions.table.actions.select-all.tooltip.select"}}
            {{/if}}
          </:tooltip>
        </PixTooltip>

        <PixButton @variant="tertiary" @isDisabled={{true}}>
          <PixIcon @name="download" />
          {{t "pages.sessions.table.actions.download-results"}}
        </PixButton>
        <PixButton @variant="tertiary" @isDisabled={{true}}>
          <PixIcon @name="download" />
          {{t "pages.sessions.table.actions.download-certificates"}}
        </PixButton>
      </div>

      {{#if @sessions}}
        <PixTable @variant="admin" @data={{@sessions}} @caption={{t "pages.sessions.table.caption"}}>
          <:columns as |session context|>
            <PixTableColumn @context={{context}}>
              <:header>
              </:header>
              <:cell>
                <PixCheckbox
                  @id={{concat "checkbox_" session.id}}
                  {{on "change" (fn this.toggleRowSelection session.id)}}
                  @checked={{this.isRowSelected session.id}}
                  @screenReaderOnly={{true}}
                  @size="small"
                >
                  <:label>{{t "pages.sessions.table.actions.select-row" sessionId=session.id}}</:label>
                </PixCheckbox>
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.id"}}
              </:header>
              <:cell>
                <LinkTo @route="authenticated.sessions.session" @model={{session.id}}>
                  {{session.id}}
                </LinkTo>
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.certification-name"}}
              </:header>
              <:cell>
                {{session.certificationCenterName}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="break-word">
              <:header>
                {{t "pages.sessions.table.headers.external-id"}}
              </:header>
              <:cell>
                {{session.certificationCenterExternalId}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.type"}}
              </:header>
              <:cell>
                {{#if session.certificationCenterType}}
                  {{session.certificationCenterType}}
                {{else}}
                  -
                {{/if}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.session-date"}}
              </:header>
              <:cell>
                {{#if session.date}}
                  {{formatDate session.date}}
                {{/if}}
                à
                {{session.time}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.status"}}
              </:header>
              <:cell>
                {{session.displayStatus}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.finalization-session-date"}}
              </:header>
              <:cell>
                {{#if session.finalizedAt}}
                  {{formatDate session.finalizedAt}}
                {{/if}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.publication-session-date"}}
              </:header>
              <:cell>
                {{#if session.publishedAt}}
                  {{formatDate session.publishedAt}}
                {{/if}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.sessions.table.headers.version"}}
              </:header>
              <:cell>
                {{session.version}}
              </:cell>
            </PixTableColumn>
          </:columns>
        </PixTable>

        <PixPagination @pagination={{@sessions.meta}} />
      {{else}}
        <div class="table__empty">{{t "common.tables.empty-result"}}</div>
      {{/if}}
    </div>
  </template>
}
