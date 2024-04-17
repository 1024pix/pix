import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class Tube extends Component {
  get checked() {
    return this.args.isTubeSelected(this.args.tube);
  }

  @action
  toggleTube(event) {
    if (event.target.checked) {
      this.args.selectTube(this.args.tube);
    } else {
      this.args.unselectTube(this.args.tube);
    }
  }
}
