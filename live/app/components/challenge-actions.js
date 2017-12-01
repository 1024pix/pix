import Component from '@ember/component';
import { computed } from '@ember/object';

const pendingValue = 'pending';
const enableValue = 'enable';
export default Component.extend({

  classNames: ['challenge-actions'],

  challengeSkipped: null, // action
  answerValidated: null, // action

  _validateButtonStatus: enableValue, // enable, pending, offline
  _skipButtonStatus: enableValue,
  isValidateButtonEnable: computed.equal('_validateButtonStatus', enableValue),
  isValidateButtonPending: computed.equal('_validateButtonStatus', pendingValue),
  isValidateButtonOffline: computed.equal('_validateButtonStatus', 'offline'),

  isSkipButtonEnable: computed.equal('_skipButtonStatus', enableValue),
  isSkipButtonPending: computed.equal('_skipButtonStatus', pendingValue),

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
