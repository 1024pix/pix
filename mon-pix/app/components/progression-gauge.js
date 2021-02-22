import { htmlSafe } from '@ember/string';
import Component from '@glimmer/component';

export default class ProgressionGauge extends Component {
  get totalGaugeStyle() {
    return htmlSafe(`width: ${this.args.total}%`);
  }

  get valueGaugeStyle() {
    return htmlSafe(`width: ${this.args.value}%`);
  }
}
