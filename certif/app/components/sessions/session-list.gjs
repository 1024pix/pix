import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';
import get from 'lodash/get';

import { CREATED, FINALIZED, PROCESSED } from '../../models/session-management';
import SessionDeleteConfirmModal from './session-delete-confirm-modal';

export default class SessionList extends Component {
  @tracked shouldDisplaySessionDeletionModal = false;
  @tracked currentSessionToBeDeletedId = null;
  @tracked currentEnrolledCandidatesCount = null;
  @service store;
  @service pixToast;
  @service intl;
  @service locale;

  @action statusLabel(status) {
    if (status === FINALIZED) return this.intl.t(`pages.sessions.list.status.${FINALIZED}`);
    if (status === PROCESSED) return this.intl.t(`pages.sessions.list.status.${PROCESSED}`);
    return this.intl.t(`pages.sessions.list.status.${CREATED}`);
  }

  @action
  openSessionDeletionConfirmModal(sessionId, enrolledCandidatesCount, event) {
    event.stopPropagation();
    this.currentSessionToBeDeletedId = sessionId;
    this.currentEnrolledCandidatesCount = enrolledCandidatesCount;
    this.shouldDisplaySessionDeletionModal = true;
  }

  @action
  closeSessionDeletionConfirmModal() {
    this.shouldDisplaySessionDeletionModal = false;
  }

  @action
  async deleteSession() {
    const sessionSummary = this.store.peekRecord('session-summary', this.currentSessionToBeDeletedId);
    try {
      await sessionSummary.destroyRecord();
      this.pixToast.sendSuccessNotification({ message: this.intl.t('pages.sessions.list.delete-modal.success') });
    } catch (error) {
      if (this._doesNotExist(error)) {
        this._handleSessionDoesNotExistsError();
      } else if (this._sessionHasStarted(error)) {
        this._handleSessionHasStartedError();
      } else {
        this._handleUnknownSavingError();
      }
    }
    this.closeSessionDeletionConfirmModal();
  }

  _sessionHasStarted(error) {
    return get(error, 'errors[0].status') === '409';
  }

  _doesNotExist(error) {
    return get(error, 'errors[0].status') === '404';
  }

  _handleUnknownSavingError() {
    this.pixToast.sendErrorNotification({ message: this.intl.t('pages.sessions.list.delete-modal.errors.unknown') });
  }

  _handleSessionDoesNotExistsError() {
    this.pixToast.sendErrorNotification({
      message: this.intl.t('pages.sessions.list.delete-modal.errors.session-does-not-exists'),
    });
  }

  _handleSessionHasStartedError() {
    this.pixToast.sendErrorNotification({
      message: this.intl.t('pages.sessions.list.delete-modal.errors.session-has-started'),
    });
  }

  <template>
    {{#if @sessionSummaries.length}}
      <PixTable
        @onRowClick={{@goToSessionDetails}}
        @data={{@sessionSummaries}}
        @variant='certif'
        @caption={{t 'pages.sessions.list.table.session-caption'}}
      >
        <:columns as |sessionSummary context|>
          <PixTableColumn @context={{context}} class='table__column--small'>
            <:header>
              {{t 'common.forms.session-labels.session-number'}}
            </:header>
            <:cell>
              <LinkTo
                @route='authenticated.sessions.details'
                @model={{sessionSummary.id}}
                aria-label='{{t "pages.sessions.list.table.row.session-and-id" sessionId=sessionSummary.id}}'
              >
                {{sessionSummary.id}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class='table__column--hyphen'>
            <:header>
              {{t 'common.forms.session-labels.center-name'}}
            </:header>
            <:cell>
              {{sessionSummary.address}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class='table__column--hyphen'>
            <:header>
              {{t 'common.forms.session-labels.room'}}
            </:header>
            <:cell>
              {{sessionSummary.room}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class='table__column--small'>
            <:header>
              {{t 'common.forms.session-labels.date'}}
            </:header>
            <:cell>
              {{dayjsFormat sessionSummary.date 'DD/MM/YYYY' allow-empty=true}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class='table__column--small'>
            <:header>
              {{t 'common.forms.session-labels.time'}}
            </:header>
            <:cell>
              {{dayjsFormat sessionSummary.time 'HH:mm' inputFormat='HH:mm:ss' allow-empty=true}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'common.forms.session-labels.invigilator'}}
            </:header>
            <:cell>
              {{sessionSummary.examiner}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class='table__column--small'>
            <:header>
              {{t 'pages.sessions.list.table.header.enrolled-candidates'}}
            </:header>
            <:cell>
              {{sessionSummary.enrolledCandidatesCount}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'pages.sessions.list.table.header.effective-candidates'}}
            </:header>
            <:cell>
              {{sessionSummary.effectiveCandidatesCount}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'common.forms.session-labels.status'}}
            </:header>
            <:cell>
              {{this.statusLabel sessionSummary.status}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              <span class='screen-reader-only'>
                {{t 'pages.sessions.list.table.header.actions'}}
              </span>
            </:header>
            <:cell>
              {{#if sessionSummary.hasEffectiveCandidates}}
                <PixTooltip @position='left' @isInline={{true}} @id='tooltip-delete-session-button'>
                  <:triggerElement>
                    <PixIconButton
                      @iconName='delete'
                      @plainIcon={{true}}
                      @ariaLabel={{t
                        'pages.sessions.list.actions.delete-session.label'
                        sessionSummaryId=sessionSummary.id
                      }}
                      disabled={{true}}
                      aria-describedby='tooltip-delete-session-button'
                    />
                  </:triggerElement>
                  <:tooltip>{{t 'pages.sessions.list.actions.delete-session.disabled'}}</:tooltip>
                </PixTooltip>
              {{else}}
                <PixIconButton
                  @iconName='delete'
                  @plainIcon={{true}}
                  @ariaLabel={{t 'pages.sessions.list.actions.delete-session.label' sessionSummaryId=sessionSummary.id}}
                  disabled={{false}}
                  @triggerAction={{fn
                    this.openSessionDeletionConfirmModal
                    sessionSummary.id
                    sessionSummary.enrolledCandidatesCount
                  }}
                />
              {{/if}}
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>

      <PixPagination @pagination={{@sessionSummaries.meta}} @locale={{this.locale.currentLanguage}} />
    {{else}}
      <div class='table__empty content-text'>
        {{t 'pages.sessions.list.table.empty'}}
      </div>
    {{/if}}

    <SessionDeleteConfirmModal
      @showModal={{this.shouldDisplaySessionDeletionModal}}
      @close={{this.closeSessionDeletionConfirmModal}}
      @sessionId={{this.currentSessionToBeDeletedId}}
      @enrolledCandidatesCount='{{this.currentEnrolledCandidatesCount}}'
      @confirm={{this.deleteSession}}
    />
  </template>
}
