import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import noop from 'lodash/noop';

export default class JuryComment extends Component {
  @service accessControl;

  @tracked editingMode = false;
  @tracked commentBeingEdited;
  @tracked shouldDisplayDeletionConfirmationModal = false;

  constructor() {
    super(...arguments);
  }

  get comment() {
    return this.args.comment;
  }

  @action
  async submitForm(event) {
    event.preventDefault();
    try {
      await this.args.onFormSubmit(this.commentBeingEdited);
      this.exitEditingMode();
    } catch {
      noop();
    }
  }

  @action
  enterEditingMode() {
    this.editingMode = true;
    this.commentBeingEdited = this.comment;
  }

  @action
  exitEditingMode() {
    this.editingMode = false;
    this.commentBeingEdited = '';
  }

  @action
  openDeletionConfirmationModal() {
    this.shouldDisplayDeletionConfirmationModal = true;
  }

  @action
  closeDeletionConfirmationModal() {
    this.shouldDisplayDeletionConfirmationModal = false;
  }

  @action
  async confirmDeletion() {
    try {
      this.closeDeletionConfirmationModal();
      await this.args.onDeleteButtonClicked();
    } catch {
      noop();
    }
  }

  @action
  updateCommentBeingEdited(event) {
    this.commentBeingEdited = event.target.value;
  }

  get commentExists() {
    return this.comment !== null;
  }

  get shouldDisplayForm() {
    return this.editingMode || !this.commentExists;
  }
}
