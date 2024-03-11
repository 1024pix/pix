import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Replace extends Component {
  @tracked displayModal = false;

  @action
  toggleModal() {
    this.displayModal = !this.displayModal;
  }
}
