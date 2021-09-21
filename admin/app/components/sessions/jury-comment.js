import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import noop from 'lodash/noop';

export default class JuryComment extends Component {
  @tracked editingMode = false;
  @tracked comment;
  @tracked commentBeingEdited;

  constructor() {
    super(...arguments);
    this.comment = this.args.comment;
    this.commentBeingEdited = this.args.comment;
  }

  @action
  async submitForm(event) {
    event.preventDefault();
    try {
      await this.args.onFormSubmit(this.commentBeingEdited);
      this.comment = this.commentBeingEdited;
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

  get commentExists() {
    return this.comment !== null;
  }

  get shouldDisplayForm() {
    return this.editingMode || !this.commentExists;
  }
}
