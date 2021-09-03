import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class DropdownItem extends Component {
  @action
  handleKeyDown(event) {
    if (event.key === 'Enter') {
      this.args.onClick();
    }
  }
}
