import snakeCase from 'lodash/snakeCase';
import { action, computed } from '@ember/object';
import Component from '@glimmer/component';

export default class Dialog extends Component {
  constructor() {
    super(...arguments);
    document.addEventListener('keyup', this.closeOnEscape);
  }

  willDestroy() {
    document.removeEventListener('keyup', this.closeOnEscape);
  }

  @action
  closeOnEscape(e) {
    if (e.key === 'Escape') {
      this.args.close();
    }
  }

  @computed('title')
  get labelId() {
    return `modal_${snakeCase(this.args.title)}_label`;
  }
}
