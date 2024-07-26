import { service } from '@ember/service';
import Component from '@glimmer/component';
import isInteger from 'lodash/isInteger';

export default class TimedChallengeInstructions extends Component {
  @service intl;

  get allocatedTime() {
    if (!isInteger(this.args.time)) {
      return '';
    }

    const minutes = _getMinutes(this.args.time);
    const seconds = _getSeconds(this.args.time);

    let allocatedTime = this.intl.t('pages.timed-challenge-instructions.time.minutes', { minutes });
    if (minutes && seconds) allocatedTime += this.intl.t('pages.timed-challenge-instructions.time.and');
    allocatedTime += this.intl.t('pages.timed-challenge-instructions.time.seconds', { seconds });
    return allocatedTime;
  }
}

function _getMinutes(time) {
  return Math.floor(time / 60);
}

function _getSeconds(time) {
  return time % 60;
}
