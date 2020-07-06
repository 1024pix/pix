/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
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
