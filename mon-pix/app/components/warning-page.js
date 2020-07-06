/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import { computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import _ from 'mon-pix/utils/lodash-custom';

function _pluralize(word, count) {
  if (!count) {
    return '';
  }
  return (count > 1) ? `${count} ${word}s` : `${count} ${word}`;
}

function _getMinutes(time) {
  return Math.floor(time / 60);
}

function _getSeconds(time) {
  return time % 60;
}

function _formatTimeForText(time) {

  if (_.isNotInteger(time)) {
    return '';
  }

  const minutes = _getMinutes(time);
  const seconds = _getSeconds(time);

  const formattedMinutes = _pluralize('minute', minutes);
  const formattedSeconds = _pluralize('seconde', seconds);
  const joiningWord = (!minutes || !seconds) ? '' : ' et ';

  return `${formattedMinutes}${joiningWord}${formattedSeconds}`;
}

function _formatTimeForButton(time) {

  if (_.isNotInteger(time) || !time) {
    return 0;
  }

  const minutes = _getMinutes(time);
  const seconds = _getSeconds(time);

  const formattedMinutes = minutes;
  const formattedSeconds = (seconds < 9) ? `0${seconds}` : `${seconds}`;

  return `${formattedMinutes}:${formattedSeconds}`;
}

@classic
export default class WarningPage extends Component {
  @computed('time')
  get allocatedHumanTime() {
    return _formatTimeForText(this.time);
  }

  @computed('time')
  get allocatedTime() {
    return _formatTimeForButton(this.time);
  }
}
