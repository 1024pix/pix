import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

export default class SessionToBePublishedController extends Controller {
  @service notifications;
  @service store;
  @service accessControl;
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
      const result = await adapter.publishSessionInBatch(sessionIdsToBePublished);
      if (this._batchPublicationFailed(result)) {
        this._notifyPublicationFailure(result);
        this.send('refreshModel');
      } else {
        this._removePublishedSessionsFromStore(this.model);
        this.notifications.success('Les sessions ont été publiées avec succès');
      }
    } catch (err) {
      this.notifications.error(err);
    }
    this.hideConfirmModal();
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
      "Une ou plusieurs erreurs se sont produites, veuillez conserver la référence suivante pour investigation auprès de l'équipe technique : " +
        get(error, 'errors[0].detail'),
      { autoClear: false },
    );
  }

  _batchPublicationFailed(error) {
    return get(error, 'errors[0].code') === 'SESSION_PUBLICATION_BATCH_PARTIALLY_FAILED';
  }

  _removePublishedSessionsFromStore(sessions) {
    // unloadRecord supprime la référence, et change donc la taille du tableau a chaque itération
    const allSessions = [...sessions];
    while (allSessions.length > 0) {
      const session = allSessions.pop();
      session.unloadRecord();
    }
  }
}
