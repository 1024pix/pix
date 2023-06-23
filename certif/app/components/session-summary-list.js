import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import get from 'lodash/get';

export default class SessionSummaryList extends Component {
  @tracked shouldDisplaySessionDeletionModal = false;
  @tracked currentSessionToBeDeletedId = null;
  @tracked currentEnrolledCandidatesCount = null;
  @service store;
  @service notifications;
  @service intl;

  get currentLocale() {
    return this.intl.locale[0];
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
}
