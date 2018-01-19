import { equal } from '@ember/object/computed';
import Component from '@ember/component';

const pendingValue = 'pending';
const enableValue = 'enable';
export default Component.extend({

  classNames: ['challenge-actions'],

  challengeSkipped: null, // action
  answerValidated: null, // action

  _validateButtonStatus: enableValue, // enable, pending, offline
  _skipButtonStatus: enableValue,
  isValidateButtonEnable: equal('_validateButtonStatus', enableValue),
  isValidateButtonPending: equal('_validateButtonStatus', pendingValue),
  isValidateButtonOffline: equal('_validateButtonStatus', 'offline'),

  isSkipButtonEnable: equal('_skipButtonStatus', enableValue),
  isSkipButtonPending: equal('_skipButtonStatus', pendingValue),

  didUpdateAttrs() {
    this._super(...arguments);
    this.set('_validateButtonStatus', enableValue);
    this.set('_skipButtonStatus', enableValue);
  },

  actions: {
    skipChallenge() {
      if(this.get('_validateButtonStatus') === enableValue) {
        this.set('_skipButtonStatus', pendingValue);
        this.get('challengeSkipped')();
      }
    },

    validateAnswer() {
      if(this.get('_skipButtonStatus') === enableValue) {
        this.set('_validateButtonStatus', pendingValue);
        this.get('answerValidated')()
          .catch(() => this.set('_validateButtonStatus', enableValue));
      }
    }
  }
});
