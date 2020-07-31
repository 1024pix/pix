/* eslint ember/no-actions-hash: 0 */
/* eslint ember/no-classic-classes: 0 */
/* eslint ember/no-classic-components: 0 */
/* eslint ember/no-component-lifecycle-hooks: 0 */
/* eslint ember/require-tagless-components: 0 */

import { computed } from '@ember/object';
import { cancel, later } from '@ember/runloop';
import Component from '@ember/component';
import _ from 'mon-pix/utils/lodash-custom';
import ENV from 'mon-pix/config/environment';

const ChallengeItemGeneric = Component.extend({

  tagName: 'article',
  classNames: ['challenge-item'],
  attributeBindings: ['challenge.id:data-challenge-id'],

  isValidateButtonEnabled: true,
  isSkipButtonEnabled: true,
  hasUserConfirmedWarning: false,

  _elapsedTime: null,
  _timer: null,
  _isUserAwareThatChallengeIsTimed: false,

  init() {
    this._super(...arguments);
    if (!_.isInteger(this.challenge.timer)) {
      this._start();
    }
  },

  didUpdateAttrs() {
    this._super(...arguments);
    if (!this._isUserAwareThatChallengeIsTimed) {
      this.set('hasUserConfirmedWarning', false);
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    const timer = this._timer;
    cancel(timer);
  },

  hasChallengeTimer: computed('challenge.timer', function() {
    return _.isInteger(this.challenge.timer);
  }),

  displayFeedbackPanel: computed('_isUserAwareThatChallengeIsTimed', 'hasChallengeTimer', 'displayWarningPage', function() {
    return !this.hasChallengeTimer
      || (this.hasChallengeTimer && this._isUserAwareThatChallengeIsTimed)
      || !this.displayWarningPage;
  }),

  displayWarningPage: computed('answer', 'hasChallengeTimer', function() {
    if (!this.answer && this.hasChallengeTimer) {
      return true;
    }
    return false;
  }),

  displayTimer: computed('answer', 'hasUserConfirmedWarning', 'hasChallengeTimer', function() {
    if (!this.answer
      && this.hasChallengeTimer
      && this.hasUserConfirmedWarning) {

      return true;
    }
    return false;
  }),

  displayChallenge: computed('hasUserConfirmedWarning', 'hasChallengeTimer', 'displayWarningPage', function() {
    return !this.hasChallengeTimer
      || (this.hasUserConfirmedWarning && this.hasChallengeTimer)
      || !this.displayWarningPage;
  }),

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
      if (this.isValidateButtonEnabled && this.isSkipButtonEnabled) {
        if (this._hasError()) {

          const errorMessage = this._getErrorMessage();

          this.set('errorMessage', errorMessage);

          return;
        }

        this.set('errorMessage', null);
        this.set('_isUserAwareThatChallengeIsTimed', false);
        this.set('isValidateButtonEnabled', false);

        return this.answerValidated(this.challenge, this.assessment, this._getAnswerValue(), this._getTimeout(), this._getElapsedTime())
          .finally(() => this.set('isValidateButtonEnabled', true));
      }
    },

    resumeAssessment() {
      return this.resumeAssessment(this.assessment);
    },

    skipChallenge() {
      if (this.isValidateButtonEnabled && this.isSkipButtonEnabled) {
        this.set('errorMessage', null);
        this.set('_isUserAwareThatChallengeIsTimed', false);
        this.set('isSkipButtonEnabled', false);

        return this.answerValidated(this.challenge, this.assessment, '#ABAND#', this._getTimeout(), this._getElapsedTime())
          .finally(() => this.set('isSkipButtonEnabled', true));
      }
    },

    setUserConfirmation() {
      this._start();
      this.set('hasUserConfirmedWarning', true);
      this.set('_isUserAwareThatChallengeIsTimed', true);
    },
  },
});

export default ChallengeItemGeneric;
