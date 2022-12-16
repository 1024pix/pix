import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';

export default class ProgressBar extends Component {
  get progressBarStyle() {
    return htmlSafe(`width: ${this.args.value * 100}%`);
  }
}
