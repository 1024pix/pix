import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ModuleImage extends Component {
  @tracked modalIsOpen = false;

  get hasAlternativeText() {
    return this.args.image.alternativeText.length > 0;
  }

  @action
  showModal() {
    this.modalIsOpen = true;
    this.args.openAlternativeText(this.args.image.id);
  }

  @action
  closeModal() {
    this.modalIsOpen = false;
  }
}
