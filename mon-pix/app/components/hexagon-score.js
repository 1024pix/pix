import { action } from '@ember/object';
import { isNone } from '@ember/utils';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default class HexagonScore extends Component {
  @tracked displayHelp = 'hexagon-score__information--hidden';
  @tracked score = 0;
  @service featureToggles;

  constructor() {
    super(...arguments);
    let score = this.args.pixScore;
    score = isNone(score) ? 0 : score;

    this.score = score;

    if (this.featureToggles.featureToggles.isAprilFoolEnabled) {
      this.interval = setInterval(() => this.decrementPixScore(), 500);
    }
  }

  get aprilFoolClass() {
    return this.featureToggles.featureToggles.isAprilFoolEnabled ? 'april-fool' : '';
  }

  get maxReachablePixCount() {
    return ENV.APP.MAX_REACHABLE_LEVEL * 8 * 16;
  }

  get maxReachableLevel() {
    return ENV.APP.MAX_REACHABLE_LEVEL;
  }

  get scoreString() {
    return (isNone(this.score) || this.score === 0) ? '–' : Math.floor(this.score);
  }

  decrementPixScore() {
    this.score = Math.max(this.score - 1, -999);
  }

  @action
  restorePixScore() {
    this.score = this.args.pixScore;
    clearInterval(this.interval);
  }

  @action
  hideHelp() {
    this.displayHelp = 'hexagon-score__information--hidden';
  }

  @action
  showHelp() {
    this.displayHelp = 'hexagon-score__information--visible';
  }
}
