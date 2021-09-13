import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class JuryComment extends Component {
  @tracked editingMode = false;
  @tracked displayedComment;
  @tracked editedComment;

  constructor() {
    super(...arguments);
    this.displayedComment = this.args.comment;
    this.editedComment = this.args.comment;
  }

  @action
  async submitForm(event) {
    event.preventDefault();
    await this.args.onFormSubmit(this.editedComment);
    this.exitEditingMode();
  }

  @action
  enterEditingMode() {
    this.editingMode = true;
  }

  @action
  exitEditingMode() {
    this.editingMode = false;
    this.editedComment = this.displayedComment;
  }

  get commentExists() {
    return this.args.comment !== null;
  }

  get shouldDisplayForm() {
    return this.editingMode || !this.commentExists;
  }
}
