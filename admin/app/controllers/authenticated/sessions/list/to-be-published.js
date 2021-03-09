import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import get from 'lodash/get';

export default class SessionToBePublishedController extends Controller {
  @service notifications;
  @tracked shouldShowModal = false;

  @action
  async publishSession(toBePublishedSession) {
    try {
      await toBePublishedSession.publish();
    } catch (err) {
      const finalErr = get(err, 'errors[0].detail', err);
      this.notifications.error(finalErr);
    }
  }

  @action
  async batchPublishSessions() {
    const sessionIdsToBePublished = this.model.map((session) => session.id);
    const adapter = this.store.adapterFor('to-be-published-session');
    try {
      await adapter.publishSessionInBatch(sessionIdsToBePublished);
      this.hideConfirmModal();
      this._removePublishedSessionsFromStore(this.model);
      this.notifications.success('Les sessions ont été publiées avec succès');
    } catch (err) {
      if (this._batchPublicationFailed(err)) {
        this._notifyPublicationFailure(err);
      } else {
        this.notifications.error(err);
      }
      this.hideConfirmModal();
      this.send('refreshModel');
    }
  }

  @action
  showConfirmModal() {
    this.shouldShowModal = true;
  }

  @action
  hideConfirmModal() {
    this.shouldShowModal = false;
  }

  _notifyPublicationFailure(error) {
    this.notifications.error(
      'Une ou plusieurs erreurs se sont produites, veuillez conserver la référence suivante pour investigation auprès de l\'équipe technique : ' + get(error, 'errors[0].detail'),
      { autoClear: false },
    );
  }

  _batchPublicationFailed(error) {
    return get(error, 'errors[0].code') === 'SESSION_BATCH_PUBLICATION_FAILED';
  }

  _removePublishedSessionsFromStore(sessions) {
    sessions.map((session) => session.unloadRecord());
  }
}
