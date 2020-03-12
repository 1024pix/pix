import Component from '@glimmer/component';
import { htmlSafe } from '@ember/string';

export default class ProgressionGauge extends Component {

  get totalGaugeStyle() {
    return htmlSafe(`width: ${this.args.total}%`);
  }

  get valueGaugeStyle() {
    return htmlSafe(`width: ${this.args.value}%`);
  }
}
