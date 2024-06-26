import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Comments extends Component {
  @tracked isEditingJuryComment = false;
  @tracked commentByJury;

  @action
  editJuryComment() {
    this.isEditingJuryComment = true;
  }

  @action
  async saveJuryComment() {
    const hasBeenSaved = await this.args.onJuryCommentSave(this.commentByJury);
    if (hasBeenSaved) {
      this.cancelJuryCommentEdition();
    }
  }

  @action
  cancelJuryCommentEdition() {
    this.isEditingJuryComment = false;
  }
}
