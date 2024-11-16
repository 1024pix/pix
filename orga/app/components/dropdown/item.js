import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class DropdownItem extends Component {
  @action
  handleKeyUp(event) {
    if (event.key === 'Enter') {
      this.onClick(event);
    }
  }

  @action
  onClick(event) {
    this.args.onClick(event);
    if (typeof this.args.closeMenu === 'function') {
      this.args.closeMenu();
    }
  }
}
