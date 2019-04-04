import { equal } from '@ember/object/computed';
import Component from '@ember/component';
import ChallengeItemGeneric from './challenge-item-generic';

const { enabled, pending, offline } = ChallengeItemGeneric.buttonStatuses;

export default Component.extend({

  classNames: ['challenge-actions'],

  challengeSkipped: null, // action
  answerValidated: null, // action

  isValidateButtonEnable: equal('validateButtonStatus', enabled),
  isValidateButtonPending: equal('validateButtonStatus', pending),
  isValidateButtonOffline: equal('validateButtonStatus', offline),

  isSkipButtonEnable: equal('skipButtonStatus', enabled),
  isSkipButtonPending: equal('skipButtonStatus', pending),

  actions: {
    skipChallenge() {
      this.challengeSkipped();
    },

    validateAnswer() {
      this.answerValidated();
    },
  },
});
