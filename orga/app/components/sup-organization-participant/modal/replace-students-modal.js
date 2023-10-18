import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ReplaceStudentsModal extends Component {
  @tracked allowDeletion = false;

  @action
  async giveDeletionPermission() {
    this.allowDeletion = !this.allowDeletion;
  }
}
