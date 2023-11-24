import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ModuleImage extends Component {
  @tracked modalIsOpen = false;

  @action
  showModal() {
    this.modalIsOpen = true;
  }

  @action
  closeModal() {
    this.modalIsOpen = false;
  }
}
