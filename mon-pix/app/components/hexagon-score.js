import { action } from '@ember/object';
import { isNone } from '@ember/utils';
import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';
import { tracked } from '@glimmer/tracking';

export default class HexagonScore extends Component {
  @tracked displayHelp = 'hexagon-score__information--hidden';

  get score() {
    const score = this.args.pixScore;
    return (isNone(score) || score === 0) ? '–' : Math.floor(score);
  }

  get maxReachablePixCount() {
    return ENV.APP.MAX_REACHABLE_LEVEL * 8 * 16;
  }

  get maxReachableLevel() {
    return ENV.APP.MAX_REACHABLE_LEVEL;
  }

  @action
  hideHelp() {
    console.log('plop');
    this.displayHelp = 'hexagon-score__information--hidden';
  }

  @action
  showHelp() {
    this.displayHelp = 'hexagon-score__information--visible';
  }
}
