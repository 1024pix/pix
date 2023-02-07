import { isNone } from '@ember/utils';
import Component from '@glimmer/component';

export default class HexagonScore extends Component {
  get score() {
    const score = this.args.pixScore;
    return isNone(score) || score === 0 ? '–' : Math.floor(score);
  }
}
