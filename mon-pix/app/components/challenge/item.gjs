import { service } from '@ember/service';
import { ensureSafeComponent } from '@embroider/util';
import Component from '@glimmer/component';

import ChallengeItemQcm from '../challenge-item/challenge-item-qcm';
import ChallengeItemQcu from '../challenge-item/challenge-item-qcu';
import ChallengeItemQroc from '../challenge-item/challenge-item-qroc';
import ChallengeItemQrocm from '../challenge-item/challenge-item-qrocm';

const FOCUSEDOUT_EVENT_NAME = 'focusedout';
const FOCUSEDOUT_INTERVAL = 1000;

export default class Item extends Component {
  <template>
    <this.challengeComponent
      @challenge={{@challenge}}
      @answer={{@answer}}
      @assessment={{@assessment}}
      @timeoutChallenge={{@timeoutChallenge}}
      @resetAllChallengeInfo={{@resetAllChallengeInfo}}
      @resetChallengeInfoOnResume={{@resetChallengeInfoOnResume}}
      @hasFocusedOutOfWindow={{@hasFocusedOutOfWindow}}
      @answerValidated={{@answerValidated}}
      @resumeAssessment={{@resumeAssessment}}
      @isFocusedChallenge={{this.isFocusedChallenge}}
    />
  </template>
  @service currentUser;
  @service router;
  @service store;

  constructor() {
    super(...arguments);
    if (this.isFocusedChallenge && !this.args.answer) {
      this._setFocusOutEventListener();
    }
  }

  get challengeComponent() {
    let result;
    const challenge = this.args.challenge;
    const challengeType = challenge.get('type').toUpperCase();

    if (['QCUIMG', 'QCU'].includes(challengeType)) {
      result = ChallengeItemQcu;
    } else if (['QCMIMG', 'QCM'].includes(challengeType)) {
      result = ChallengeItemQcm;
    } else if (['QROC'].includes(challengeType)) {
      result = ChallengeItemQroc;
    } else if (['QROCM', 'QROCM-IND', 'QROCM-DEP'].includes(challengeType)) {
      result = ChallengeItemQrocm;
    }

    return ensureSafeComponent(result, this);
  }

  _setFocusOutEventListener() {
    document.addEventListener(FOCUSEDOUT_EVENT_NAME, this._focusedoutListener);
    this._hadFocus = document.hasFocus();
    this._pollHasFocusInterval = setInterval(this._pollHasFocus, FOCUSEDOUT_INTERVAL);
  }

  _pollHasFocus = () => {
    const hasFocus = document.hasFocus();
    if (!hasFocus && this._hadFocus) {
      const hasFocusOutEvent = new CustomEvent(FOCUSEDOUT_EVENT_NAME);
      document.dispatchEvent(hasFocusOutEvent);
    }
    this._hadFocus = hasFocus;
  };

  _focusedoutListener = () => {
    this.args.onFocusOutOfWindow();
    this.clearFocusOutEventListener();
  };

  clearFocusOutEventListener = () => {
    clearInterval(this._pollHasFocusInterval);
    document.removeEventListener(FOCUSEDOUT_EVENT_NAME, this._focusedoutListener);
  };

  get isFocusedChallenge() {
    return this.args.challenge.focused;
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.clearFocusOutEventListener();
  }
}
