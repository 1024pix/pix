import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import { cancel, later } from '@ember/runloop';
import Component from '@ember/component';
import RSVP from 'rsvp';
import callOnlyOnce from '../utils/call-only-once';
import _ from 'mon-pix/utils/lodash-custom';
import ENV from 'mon-pix/config/environment';

const buttonStatuses = {
  enabled: 'ENABLED',
  pending: 'PENDING',
  offline: 'OFFLINE',
};

const ChallengeItemGeneric = Component.extend({

  tagName: 'article',
  classNames: ['challenge-item'],
  attributeBindings: ['challenge.id:data-challenge-id'],

  validateButtonStatus: buttonStatuses.enabled,
  skipButtonStatus: buttonStatuses.enabled,

  isValidateButtonEnabled: equal('validateButtonStatus', buttonStatuses.enabled),
  isSkipButtonEnabled: equal('skipButtonStatus', buttonStatuses.enabled),

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
    if (!this._isUserAwareThatChallengeIsTimed) {
      this.set('hasUserConfirmWarning', false);
      this.set('hasChallengeTimer', this.hasTimerDefined());
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    const timer = this._timer;
    cancel(timer);
  },

  hasUserConfirmWarning: computed('challenge', function() {
    return false;
  }),

  hasChallengeTimer: computed('challenge', function() {
    return this.hasTimerDefined();
  }),

  canDisplayFeedbackPanel: computed('_isUserAwareThatChallengeIsTimed', function() {
    return !this.hasTimerDefined() || (this.hasTimerDefined() && this._isUserAwareThatChallengeIsTimed);
  }),

  hasTimerDefined() {
    return _.isInteger(this.get('challenge.timer'));
  },

  _getTimeout() {
    return this.$('.timeout-jauge-remaining').attr('data-spent');
  },

  _getElapsedTime() {
    return this._elapsedTime;
  },

  _start() {
    this.set('_elapsedTime', 0);
    this._tick();
  },

  _tick() {
    if (ENV.APP.isChallengeTimerEnable) {
      const timer = later(this, function() {
        const elapsedTime = this._elapsedTime;
        this.set('_elapsedTime', elapsedTime + 1);
        this.notifyPropertyChange('_elapsedTime');
        this._tick();
      }, 1000);

      this.set('_timer', timer);
    }
  },

  actions: {
    validateAnswer() {
      if (this.validateButtonStatus === buttonStatuses.enabled && this.skipButtonStatus === buttonStatuses.enabled) {
        if (this._hasError()) {

          const errorMessage = this._getErrorMessage();
          
          this.set('errorMessage', errorMessage);
          
          return RSVP.reject(errorMessage).catch(() => null);
        }
        
        this.set('errorMessage', null);
        this.set('_isUserAwareThatChallengeIsTimed', false);
        this.set('validateButtonStatus', buttonStatuses.pending);
        
        return this.answerValidated(this.challenge, this.assessment, this._getAnswerValue(), this._getTimeout(), this._getElapsedTime())
          .then(() => this.set('validateButtonStatus', buttonStatuses.enabled))
          .catch(() => this.set('validateButtonStatus', buttonStatuses.enabled));
      }

      return RSVP.resolve();
    },

    skipChallenge: callOnlyOnce(function() {
      if (this.validateButtonStatus === buttonStatuses.enabled && this.skipButtonStatus === buttonStatuses.enabled) {
        this.set('errorMessage', null);
        this.set('_isUserAwareThatChallengeIsTimed', false);
        this.set('skipButtonStatus', buttonStatuses.pending);

        return this.answerValidated(this.challenge, this.assessment, '#ABAND#', this._getTimeout(), this._getElapsedTime())
          .then(() => this.set('skipButtonStatus', buttonStatuses.enabled))
          .catch(() => this.set('skipButtonStatus', buttonStatuses.enabled));
      }
      
      return RSVP.resolve();
    }),

    setUserConfirmation() {
      this._start();
      this.toggleProperty('hasUserConfirmWarning');
      this.toggleProperty('hasChallengeTimer');
      this.set('_isUserAwareThatChallengeIsTimed', true);
    },
  },
});

ChallengeItemGeneric.buttonStatuses = buttonStatuses;

export default ChallengeItemGeneric;
