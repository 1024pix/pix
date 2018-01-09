import Ember from 'ember';
import RSVP from 'rsvp';
import callOnlyOnce from '../utils/call-only-once';
import _ from 'pix-live/utils/lodash-custom';
import ENV from 'pix-live/config/environment';

const ChallengeItemGeneric = Ember.Component.extend({

  tagName: 'article',
  classNames: ['challenge-item'],
  attributeBindings: ['challenge.id:data-challenge-id'],

  answerValidated: null, // action

  _elapsedTime: null,
  _timer: null,
  _isUserAwareThatChallengeIsTimed: false,

  init() {
    this._super(...arguments);
    if (!_.isInteger(this.get('challenge.timer'))) {
      this._start();
    }
  },

  didUpdateAttrs() {
    this._super(...arguments);
    if (!this.get('_isUserAwareThatChallengeIsTimed')) {
      this.set('hasUserConfirmWarning', false);
      this.set('hasChallengeTimer', this.hasTimerDefined());
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    const timer = this.get('_timer');
    Ember.run.cancel(timer);
  },

  hasUserConfirmWarning: Ember.computed('challenge', function() {
    return false;
  }),

  hasChallengeTimer: Ember.computed('challenge', function() {
    return this.hasTimerDefined();
  }),

  canDisplayFeedbackPanel: Ember.computed('_isUserAwareThatChallengeIsTimed', function() {
    return !this.hasTimerDefined() || (this.hasTimerDefined() && this.get('_isUserAwareThatChallengeIsTimed'));
  }),

  hasTimerDefined() {
    return _.isInteger(this.get('challenge.timer'));
  },

  _getTimeout() {
    return this.$('.timeout-jauge-remaining').attr('data-spent');
  },

  _getElapsedTime() {
    return this.get('_elapsedTime');
  },

  _start() {
    this.set('_elapsedTime', 0);
    this._tick();
  },

  _tick() {
    if (ENV.APP.isChallengeTimerEnable) {
      const timer = Ember.run.later(this, function() {
        const elapsedTime = this.get('_elapsedTime');
        this.set('_elapsedTime', elapsedTime + 1);
        this.notifyPropertyChange('_elapsedTime');
        this._tick();
      }, 1000);

      this.set('_timer', timer);
    }
  },

  actions: {

    validateAnswer() {
      if (this._hasError()) {
        const errorMessage = this._getErrorMessage();
        this.set('errorMessage', errorMessage);
        return RSVP.reject(errorMessage);
      }
      const answerValue = this._getAnswerValue();
      this.set('errorMessage', null);
      this.set('_isUserAwareThatChallengeIsTimed', false);
      return this.get('answerValidated')(this.get('challenge'), this.get('assessment'), answerValue, this._getTimeout(), this._getElapsedTime());
    },

    skipChallenge: callOnlyOnce(function() {
      this.set('errorMessage', null);
      this.set('_isUserAwareThatChallengeIsTimed', false);
      this.get('answerValidated')(this.get('challenge'), this.get('assessment'), '#ABAND#', this._getTimeout(), this._getElapsedTime());
    }),

    setUserConfirmation() {
      this._start();
      this.toggleProperty('hasUserConfirmWarning');
      this.toggleProperty('hasChallengeTimer');
      this.set('_isUserAwareThatChallengeIsTimed', true);
    }
  }

});

export default ChallengeItemGeneric;
