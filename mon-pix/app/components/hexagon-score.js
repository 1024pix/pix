import { action } from '@ember/object';
import { isNone } from '@ember/utils';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ENV from 'mon-pix/config/environment';

export default class HexagonScore extends Component {
  @tracked displayHelp = false;

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
    this.displayHelp = false;
  }

  @action
  showHelp() {
    this.displayHelp = true;
  }

  @action
  toggleTooltip() {
    this.displayHelp = !this.displayHelp;
  }
}
