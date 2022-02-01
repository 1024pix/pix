import Component from '@glimmer/component';
import { htmlSafe } from '@ember/string';

export default class ProgressBar extends Component {
  get progressBarStyle() {
    return htmlSafe(`width: ${this.args.value * 100}%`);
  }
}
