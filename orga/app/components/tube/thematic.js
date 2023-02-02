import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class Thematic extends Component {
  @action
  updateState(element) {
    element.indeterminate = this.state === 'indeterminate';
  }

  get state() {
    return this.args.getThematicState(this.args.thematic);
  }

  get checked() {
    return this.state === 'checked';
  }

  set checked(checked) {
    if (checked) {
      this.args.selectThematic(this.args.thematic);
    } else {
      this.args.unselectThematic(this.args.thematic);
    }
  }
}
