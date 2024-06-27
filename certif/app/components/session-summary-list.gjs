import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import get from 'lodash/get';

import SessionDeleteConfirmModal from './session-delete-confirm-modal';
import SessionSummaryRow from './session-summary-row';

export default class SessionSummaryList extends Component {
  @tracked shouldDisplaySessionDeletionModal = false;
  @tracked currentSessionToBeDeletedId = null;
  @tracked currentEnrolledCandidatesCount = null;
  @service store;
  @service notifications;
  @service intl;

  // GETTERS
  get currentLocale() {
    return this.intl.locale[0];
  }

  // ACTIONS
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
    this.notifications.clearAll();
    const sessionSummary = this.store.peekRecord('session-summary', this.currentSessionToBeDeletedId);
    try {
      await sessionSummary.destroyRecord();
      this.notifications.success(this.intl.t('pages.sessions.list.delete-modal.success'));
    } catch (err) {
      if (this._doesNotExist(err)) {
        this._handleSessionDoesNotExistsError();
      } else if (this._sessionHasStarted(err)) {
        this._handleSessionHasStartedError();
      } else {
        this._handleUnknownSavingError();
      }
    }
    this.closeSessionDeletionConfirmModal();
  }

  // PRIVATE
  _sessionHasStarted(err) {
    return get(err, 'errors[0].status') === '409';
  }

  _doesNotExist(err) {
    return get(err, 'errors[0].status') === '404';
  }

  _handleUnknownSavingError() {
    this.notifications.error(this.intl.t('pages.sessions.list.delete-modal.errors.unknown'));
  }

  _handleSessionDoesNotExistsError() {
    this.notifications.error(this.intl.t('pages.sessions.list.delete-modal.errors.session-does-not-exists'));
  }

  _handleSessionHasStartedError() {
    this.notifications.error(this.intl.t('pages.sessions.list.delete-modal.errors.session-has-started'));
  }

  <template>
    <div class='table--with-row-clickable session-summary-list' role='tabpanel'>
      <div class='panel'>
        <div class='table content-text content-text--small'>
          <table>
            <thead>
              <tr>
                <th class='table__column table__column--small' scope='col'>
                  {{t 'common.forms.session-labels.session-number'}}
                </th>
                <th class='table__column table__column--small' scope='col'>
                  {{t 'common.forms.session-labels.center-name'}}
                </th>
                <th class='table__column table__column--small' scope='col'>
                  {{t 'common.forms.session-labels.room'}}
                </th>
                <th class='table__column table__column--small' scope='col'>
                  {{t 'common.forms.session-labels.date'}}
                </th>
                <th class='table__column table__column--small' scope='col'>
                  {{t 'common.forms.session-labels.time'}}
                </th>
                <th class='table__column table__column--small' scope='col'>
                  {{t 'common.forms.session-labels.invigilator'}}
                </th>
                <th class='table__column table__column' scope='col'>
                  {{t 'pages.sessions.list.table.header.enrolled-candidates'}}
                </th>
                <th class='table__column table__column' scope='col'>
                  {{t 'pages.sessions.list.table.header.effective-candidates'}}
                </th>
                <th class='table__column table__column--small' scope='col'>
                  {{t 'common.forms.session-labels.status'}}
                </th>
                <th class='table__column table__column--small' scope='col'>
                  <span class='screen-reader-only'>
                    {{t 'pages.sessions.list.table.header.actions'}}
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {{#each @sessionSummaries as |sessionSummary|}}
                <SessionSummaryRow
                  @sessionSummary={{sessionSummary}}
                  @goToSessionDetails={{@goToSessionDetails}}
                  @openSessionDeletionConfirmModal={{this.openSessionDeletionConfirmModal}}
                />
              {{/each}}
            </tbody>
          </table>
          {{#if (eq @sessionSummaries.length 0)}}
            <div class='table__empty content-text'>
              {{t 'pages.sessions.list.table.empty'}}
            </div>
          {{/if}}
        </div>
      </div>
    </div>

    <PixPagination @pagination={{@sessionSummaries.meta}} @locale={{this.currentLocale}} />

    <SessionDeleteConfirmModal
      @showModal={{this.shouldDisplaySessionDeletionModal}}
      @close={{this.closeSessionDeletionConfirmModal}}
      @sessionId={{this.currentSessionToBeDeletedId}}
      @enrolledCandidatesCount='{{this.currentEnrolledCandidatesCount}}'
      @confirm={{this.deleteSession}}
    />
  </template>
}
