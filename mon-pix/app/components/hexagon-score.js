/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import { action, computed } from '@ember/object';
import { isNone } from '@ember/utils';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import ENV from 'mon-pix/config/environment';

@classic
export default class HexagonScore extends Component {
  displayHelp = 'hexagon-score__information--hidden';

  @computed('pixScore')
  get score() {
    return (isNone(this.pixScore) || this.pixScore === 0) ? '–' : Math.floor(this.pixScore);
  }

  get maxReachablePixCount() {
    return ENV.APP.MAX_REACHABLE_LEVEL * 8 * 16;
  }

  get maxReachableLevel() {
    return ENV.APP.MAX_REACHABLE_LEVEL;
  }

  @action
  hideHelp() {
    this.set('displayHelp', 'hexagon-score__information--hidden');
  }

  @action
  showHelp() {
    this.set('displayHelp', 'hexagon-score__information--visible');
  }
}
