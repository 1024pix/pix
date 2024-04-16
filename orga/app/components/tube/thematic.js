import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class Thematic extends Component {
  get isIndeterminate() {
    return this.state === 'indeterminate';
  }

  get state() {
    return this.args.getThematicState(this.args.thematic);
  }

  get isChecked() {
    return ['checked', 'indeterminate'].includes(this.state);
  }

  @action
  toggleThematic(event) {
    if (event.target.checked) {
      this.args.selectThematic(this.args.thematic);
    } else {
      this.args.unselectThematic(this.args.thematic);
    }
  }
}
