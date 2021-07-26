import snakeCase from 'lodash/snakeCase';
import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class Dialog extends Component {
  constructor() {
    super(...arguments);
    document.addEventListener('keyup', this.closeOnEscape);
  }

  get containerClass() {
    return `modal-dialog ${this.args.additionalContainerClass}`;
  }

  willDestroy() {
    super.willDestroy(...arguments);
    document.removeEventListener('keyup', this.closeOnEscape);
  }

  @action
  closeOnEscape(e) {
    if (e.key === 'Escape') {
      this.args.close();
    }
  }

  get labelId() {
    return `modal_${snakeCase(this.args.title)}_label`;
  }
}
