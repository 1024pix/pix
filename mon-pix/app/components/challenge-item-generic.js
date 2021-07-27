import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import isInteger from 'lodash/isInteger';
import ENV from 'mon-pix/config/environment';

export default class ChallengeItemGeneric extends Component {

  @tracked isValidateButtonEnabled = true;
  @tracked isSkipButtonEnabled = true;
  @tracked hasUserConfirmedWarning = false;
  @tracked hasChallengeTimedOut = false;
  @tracked errorMessage = null;
  @tracked hasFocusedOutOfWindow = false;
  @tracked hasFocusedOutOfChallenge = false;
  @tracked isTooltipClosed = false;

  get displayTimer() {
    return this.isTimedChallengeWithoutAnswer && this.hasUserConfirmedWarning;
  }

  get displayChallenge() {
    if (!this._isTimedChallenge) {
      return true;
    }

    if (this._isTimedChallenge) {
      if (this.hasUserConfirmedWarning || this.args.answer) return true;
    }

    return false;
  }

  get _isTimedChallenge() {
    return isInteger(this.args.challenge.timer);
  }

  get isFocusedChallenge() {
    return ENV.APP.FT_FOCUS_CHALLENGE_ENABLED && this.args.challenge.focused;
  }

  get isTimedChallengeWithoutAnswer() {
    return this._isTimedChallenge && !this.args.answer;
  }

  _getTimeout() {
    if (this._isTimedChallenge) {
      if (this.hasChallengeTimedOut) {
        return -1 ;
      } else {
        return this.args.challenge.timer;
      }
    } else {
      return null;
    }
  }

  @action
  hideOutOfFocusBorder() {
    if (this.isFocusedChallenge && this.isTooltipClosed) {
      this.args.focusedIn();
      this.hasFocusedOutOfChallenge = false;
    }
  }

  @action
  showOutOfFocusBorder() {
    if (this.isFocusedChallenge && this.isTooltipClosed) {
      this.args.focusedOut();
      this.hasFocusedOutOfChallenge = true;
    }
  }

  @action
  setChallengeAsTimedOut() {
    this.hasChallengeTimedOut = true;
    this.args.timeoutChallenge();
  }

  @action
  validateAnswer(event) {
    event.preventDefault();

    if (this.isValidateButtonEnabled && this.isSkipButtonEnabled) {

      if (this._hasError() && !this.hasChallengeTimedOut) {
        const errorMessage = this._getErrorMessage();
        this.errorMessage = errorMessage;
        return;
      }

      this.errorMessage = null;
      this.isValidateButtonEnabled = false;

      return this.args.answerValidated(this.args.challenge, this.args.assessment, this._getAnswerValue(), this._getTimeout())
        .finally(() => {
          this.isValidateButtonEnabled = true;
          this.args.finishChallenge();
        });
    }
  }

  @action
  resumeAssessment() {
    return this.args.resumeAssessment(this.args.assessment);
  }

  @action
  skipChallenge() {
    if (this.isValidateButtonEnabled && this.isSkipButtonEnabled) {
      this.errorMessage = null;
      this.isSkipButtonEnabled = false;

      return this.args.answerValidated(this.args.challenge, this.args.assessment, '#ABAND#', this._getTimeout())
        .finally(() => {
          this.isSkipButtonEnabled = true;
          this.args.finishChallenge();
        });
    }
  }

  @action
  setUserConfirmation() {
    this.hasUserConfirmedWarning = true;
  }

  @action
  enableFocusedChallenge() {
    this.isTooltipClosed = true;
    this._setOnBlurEventToWindow();
  }

  _setOnBlurEventToWindow() {
    window.onblur = () => {
      this.hasFocusedOutOfWindow = true;
      this._clearOnBlurMethod();
    };
  }


  _clearOnBlurMethod() {
    window.onblur = null;
  }
}
