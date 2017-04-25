import Ember from 'ember';
import callOnlyOnce from '../utils/call-only-once';
import _ from 'pix-live/utils/lodash-custom';
import ENV from 'pix-live/config/environment';

const ChallengeItemGeneric = Ember.Component.extend({

  tagName: 'article',
  classNames: ['challenge-item'],
  attributeBindings: ['challenge.id:data-challenge-id'],

  _elapsedTime: null,
  _timer: null,
  _hasUserAknowledgedTimingWarning: false,

  init() {
    this._super(...arguments);
    if (!_.isInteger(this.get('challenge.timer'))) {
      this._start();
    }
  },

  didUpdateAttrs() {
    this._super(...arguments);
    if (!this.get('_hasUserAknowledgedTimingWarning')) {
      this.set('hasUserConfirmWarning', false);
      this.set('hasChallengeTimer', this.hasTimerDefined());
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    const timer = this.get('_timer');
    Ember.run.cancel(timer);
  },

  hasUserConfirmWarning: Ember.computed('challenge', function () {
    return false;
  }),

  hasChallengeTimer: Ember.computed('challenge', function () {
    return this.hasTimerDefined();
  }),

  canDisplayFeedbackPanel: Ember.computed('_hasUserAknowledgedTimingWarning', function () {
    return !this.hasTimerDefined() || (this.hasTimerDefined() && this.get('_hasUserAknowledgedTimingWarning'));
  }),

  hasTimerDefined(){
    return _.isInteger(this.get('challenge.timer'));
  },

  _getTimeout() {
    return $('.timeout-jauge-remaining').attr('data-spent');
  },

  _getElapsedTime(){
    return this.get('_elapsedTime');
  },

  _start(){
    this.set('_elapsedTime', 0);
    this._tick();
  },

  _tick(){
    if (ENV.APP.isChallengeTimerEnable) {
      const timer = Ember.run.later(this, function () {
        const elapsedTime = this.get('_elapsedTime');
        this.set('_elapsedTime', elapsedTime + 1);
        this.notifyPropertyChange('_elapsedTime');
        this._tick();
      }, 1000);

      this.set('_timer', timer);
    }
  },

  actions: {

    validate: callOnlyOnce(function () {
      if (this._hasError()) {
        this.set('errorMessage', this._getErrorMessage());
        return this.sendAction('onError', this.get('errorMessage'));
      }
      const answerValue = this._getAnswerValue();
      this.sendAction('onValidated', this.get('challenge'), this.get('assessment'), answerValue, this._getTimeout(), this._getElapsedTime());
      this.set('_hasUserAknowledgedTimingWarning', false);
    }),

    skip: callOnlyOnce(function () {
      this.set('errorMessage', null);
      this.sendAction('onValidated', this.get('challenge'), this.get('assessment'), '#ABAND#', this._getTimeout(), this._getElapsedTime());
      this.set('_hasUserAknowledgedTimingWarning', false);
    }),

    setUserConfirmation() {
      this._start();
      this.toggleProperty('hasUserConfirmWarning');
      this.toggleProperty('hasChallengeTimer');
      this.set('_hasUserAknowledgedTimingWarning', true);
    }
  }

});

export default ChallengeItemGeneric;
