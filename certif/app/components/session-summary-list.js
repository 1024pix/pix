import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SessionSummaryList extends Component {
  @tracked shouldDisplaySessionDeletionModal = false;
  @tracked currentSessionToBeDeletedId = null;

  @action
  openSessionDeletionConfirmModal(sessionId, event) {
    event.stopPropagation();
    this.currentSessionToBeDeletedId = sessionId;
    this.shouldDisplaySessionDeletionModal = true;
  }
  @action
  closeSessionDeletionConfirmModal() {
    this.shouldDisplaySessionDeletionModal = false;
  }
}
