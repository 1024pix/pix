import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class JuryComment extends Component {
  @tracked editingMode = false;
  @tracked commentText;

  constructor() {
    super(...arguments);
    this.commentText = this.args.comment;
  }

  @action
  submitForm(event) {
    event.preventDefault();
    this.exitEditingMode();
    this.args.onFormSubmit(this.commentText);
  }

  @action
  enterEditingMode() {
    this.editingMode = true;
  }

  @action
  exitEditingMode() {
    this.editingMode = false;
  }

  get commentExists() {
    return this.args.comment !== null;
  }

  get shouldDisplayForm() {
    return this.editingMode || !this.commentExists;
  }
}
