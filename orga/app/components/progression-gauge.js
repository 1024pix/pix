import { computed } from '@ember/object';
import Component from '@ember/component';
import { htmlSafe } from '@ember/string';

export default class ProgressionGauge extends Component {
  @computed('total')
  get totalGaugeStyle() {
    return htmlSafe(`width: ${this.total}%`);
  }

  @computed('value')
  get valueGaugeStyle() {
    return htmlSafe(`width: ${this.value}%`);
  }
}
