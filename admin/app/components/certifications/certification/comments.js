import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class Comments extends Component {
  @tracked isEditingJuryComment = false;

  @action
  editJuryComment() {
    this.isEditingJuryComment = true;
  }

  @action
  async saveJuryComment() {
    const hasBeenSaved = await this.args.onJuryCommentSave();
    if (hasBeenSaved) {
      this.cancelJuryCommentEdition();
    }
  }

  @action
  cancelJuryCommentEdition() {
    this.isEditingJuryComment = false;
  }
}
