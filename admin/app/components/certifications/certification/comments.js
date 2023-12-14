import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class Comments extends Component {
  @tracked editingComments = false;

  @action
  editComments() {
    this.editingComments = true;
  }

  @action
  async saveComments() {
    const hasBeenSaved = await this.args.onCommentsSave();
    if (hasBeenSaved) {
      this.cancelCommentsEdit();
    }
  }

  @action
  cancelCommentsEdit() {
    this.editingComments = false;
  }
}
