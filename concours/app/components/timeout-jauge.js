import { htmlSafe } from '@ember/string';
import Component from '@ember/component';
import { run } from '@ember/runloop';
import { set, computed } from '@ember/object';
import _ from 'mon-pix/utils/lodash-custom';
import ENV from 'mon-pix/config/environment';

// see http://stackoverflow.com/a/37770048/2595513
function fmtMSS(s) {return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;}

export default Component.extend({

  allotedTime: null,

  _totalTime: computed('allotedTime', function() {
    const actualAllotedTime = this.allotedTime;
    if (!_.isNumeric(actualAllotedTime)) {
      return 0;
    }
    return 1000 * actualAllotedTime;
  }),
  _tickInterval: 1000,
  _timer: null,
  _elapsedTime: null,
  _currentTime: Date.now(),

  remainingSeconds: computed('_elapsedTime', function() {
    return _.round((this._totalTime - this._elapsedTime) / 1000);
  }),

  remainingTime: computed('remainingSeconds', function() {
    if (this.remainingSeconds < 0) {
      return '0:00';
    }
    return fmtMSS(this.remainingSeconds);
  }),

  percentageOfTimeout: computed('_elapsedTime', function() {
    const actualAllotedTime = this.allotedTime;
    if (!_.isNumeric(actualAllotedTime) || !_.isStrictlyPositiveInteger(actualAllotedTime.toString())) {
      return 0;
    }
    return 100 - (this.remainingSeconds / actualAllotedTime) * 100;
  }),

  jaugeWidthStyle: computed('percentageOfTimeout', function() {
    return htmlSafe(`width: ${this.percentageOfTimeout}%`);
  }),

  hasFinished: computed('remainingSeconds', function() {
    return this.remainingSeconds <= 0;
  }),

  _start: function() {
    this._stop();
    set(this, '_currentTime', Date.now());
    this._tick();
  },

  _stop: function() {
    const _timer = this._timer;

    if (_timer) {
      run.cancel(_timer);
      set(this, '_timer', null);
    }
  },

  _tick: function() {
    if (ENV.APP.isTimerCountdownEnabled) {

      const _tickInterval = this._tickInterval;
      const _currentTime = this._currentTime;
      const _elapsedTime = this._elapsedTime;
      const now = Date.now();

      set(this, '_elapsedTime', _elapsedTime + (now - _currentTime));
      set(this, '_currentTime', now);
      set(this, '_timer', run.later(this, this._tick, _tickInterval));
    }
  },

  init() {
    this._super(...arguments);
    this._start();
  },

  willDestroyElement() {
    this._stop();
  }

});
