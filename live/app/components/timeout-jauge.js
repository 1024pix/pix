import Ember from 'ember';
import _ from 'pix-live/utils/lodash-custom';
import ENV from 'pix-live/config/environment';

const get = Ember.get;
const set = Ember.set;
const computed = Ember.computed;
const run = Ember.run;

// see http://stackoverflow.com/a/37770048/2595513
function fmtMSS (s) {return (s-(s%=60))/60+(9<s?':':':0')+s;}


export default Ember.Component.extend({

  allotedTime: null,


  _totalTime: Ember.computed('allotedTime', function () {
    const actualAllotedTime = get(this, 'allotedTime');
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
    return _.round((get(this, '_totalTime') - get(this, '_elapsedTime')) / 1000);
  }),

  remainingTime: computed('remainingSeconds', function() {
    if (get(this, 'remainingSeconds') < 0) {
      return '0:00';
    }
    return fmtMSS(get(this, 'remainingSeconds'));
  }),

  percentageOfTimeout: computed('_elapsedTime', function() {
    const actualAllotedTime = get(this, 'allotedTime');
    if (!_.isNumeric(actualAllotedTime) || !_.isStrictlyPositiveInteger(actualAllotedTime.toString())) {
      return 0;
    }
    return 100 - (get(this, 'remainingSeconds') / actualAllotedTime) * 100;
  }),

  hasFinished: computed('remainingSeconds', function() {
    return get(this, 'remainingSeconds') <= 0;
  }),

  _start: function() {
    this._stop();
    set(this, '_currentTime', Date.now());
    this._tick();
  },

  _stop: function() {
    const _timer = get(this, '_timer');

    if (_timer) {
      run.cancel(_timer);
      set(this, '_timer', null);
    }
  },

  _tick: function() {
    if (ENV.environment !== 'test') {

      const _tickInterval = get(this, '_tickInterval');
      const _currentTime = get(this, '_currentTime');
      const _elapsedTime = get(this, '_elapsedTime');
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
