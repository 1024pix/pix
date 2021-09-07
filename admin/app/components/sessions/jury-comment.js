import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CertificationStatusSelect extends Component {
  @tracked editingMode = false;

  @action
  submitForm(event) {
    event.preventDefault();
    this.exitEditingMode();
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
