import { PixButton, PixTable, PixTableColumn } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import ConfirmPopup from '../confirm-popup';

export default class ToBePublishedSessionsList extends Component {
  @service accessControl;

  @tracked shouldShowModal = false;
  currentSelectedSession;

  _cancelModalSelection() {
    this.shouldShowModal = false;
    this.currentSelectedSession = null;
  }

  @action
  showConfirmModal(currentSelectedSession) {
    this.shouldShowModal = true;
    this.currentSelectedSession = currentSelectedSession;
  }

  @action
  hideConfirmModal() {
    this._cancelModalSelection();
  }

  @action
  publishSession() {
    this.args.publishSession(this.currentSelectedSession);
    this._cancelModalSelection();
  }
  <template>
    {{#if @toBePublishedSessions}}
      <PixTable
        @variant="admin"
        @data={{@toBePublishedSessions}}
        @caption={{t "pages.sessions.table.to-be-published.caption"}}
      >
        <:columns as |row toBePublishedSession|>
          <PixTableColumn @context={{toBePublishedSession}}>
            <:header>
              {{t "pages.sessions.table.to-be-published.headers.id"}}
            </:header>
            <:cell>
              <LinkTo @route="authenticated.sessions.session" @model={{row.id}}>
                {{row.id}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{toBePublishedSession}}>
            <:header>
              {{t "pages.sessions.table.to-be-published.headers.certification-name"}}
            </:header>
            <:cell>
              {{row.certificationCenterName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{toBePublishedSession}}>
            <:header>
              {{t "pages.sessions.table.to-be-published.headers.session-date"}}
            </:header>
            <:cell>
              {{row.printableDateAndTime}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{toBePublishedSession}}>
            <:header>
              {{t "pages.sessions.table.to-be-published.headers.finalization-date"}}
            </:header>
            <:cell>
              {{row.printableFinalizationDate}}
            </:cell>
          </PixTableColumn>
          {{#if this.accessControl.hasAccessToCertificationActionsScope}}
            <PixTableColumn @context={{toBePublishedSession}}>
              <:header>
                {{t "pages.sessions.table.to-be-published.headers.actions"}}
              </:header>
              <:cell>
                <PixButton
                  @triggerAction={{fn this.showConfirmModal row}}
                  @size="small"
                  aria-label={{t
                    "pages.sessions.table.to-be-published.cell.publish-button.aria-label"
                    sessionId=row.id
                  }}
                  @iconBefore="session"
                  @plainIconBefore={{true}}
                >
                  {{t "pages.sessions.table.to-be-published.cell.publish-button.label"}}
                </PixButton>
              </:cell>
            </PixTableColumn>
          {{/if}}
        </:columns>
      </PixTable>
    {{else}}
      <div class="table__empty">{{t "common.tables.empty-result"}}</div>
    {{/if}}

    <ConfirmPopup
      @message={{t "pages.sessions.table.to-be-published.modals.publication"}}
      @confirm={{this.publishSession}}
      @cancel={{this.hideConfirmModal}}
      @show={{this.shouldShowModal}}
    />
  </template>
}
