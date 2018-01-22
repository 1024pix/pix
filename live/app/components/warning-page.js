import { computed } from '@ember/object';
import Component from '@ember/component';
import _ from 'pix-live/utils/lodash-custom';

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

export default Component.extend({

  allocatedHumanTime: computed('time', function() {
    return _formatTimeForText(this.get('time'));
  }),

  allocatedTime: computed('time', function() {
    return _formatTimeForButton(this.get('time'));
  }),

  actions: {
    confirmWarning() {
      this.sendAction('hasUserConfirmWarning');
    }
  }
});
