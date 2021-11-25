import Component from '@glimmer/component';
import isInteger from 'lodash/isInteger';

export default class TimedChallengeInstructions extends Component {
  get allocatedTime() {
    return _formatTime(this.args.time);
  }
}

function _formatTime(time) {
  if (!isInteger(time)) {
    return '';
  }

  const minutes = _getMinutes(time);
  const seconds = _getSeconds(time);

  const formattedMinutes = _pluralize('minute', minutes);
  const formattedSeconds = _pluralize('seconde', seconds);
  const joiningWord = !minutes || !seconds ? '' : ' et ';

  return `${formattedMinutes}${joiningWord}${formattedSeconds}`;
}

function _getMinutes(time) {
  return Math.floor(time / 60);
}

function _getSeconds(time) {
  return time % 60;
}

function _pluralize(word, count) {
  if (!count) {
    return '';
  }
  return count > 1 ? `${count} ${word}s` : `${count} ${word}`;
}
