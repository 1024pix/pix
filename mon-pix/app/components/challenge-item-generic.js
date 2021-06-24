import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import isInteger from 'lodash/isInteger';

export default class ChallengeItemGeneric extends Component {

  @tracked isValidateButtonEnabled = true;
  @tracked isSkipButtonEnabled = true;
  @tracked hasUserConfirmedWarning = false;
  @tracked hasUserConfirmedFocusWarning = false;
  @tracked hasChallengeTimedOut = false;
  @tracked errorMessage = null;
  @tracked hasFocusedOut = false;

  get displayTimer() {
    return this.isTimedChallengeWithoutAnswer && this.hasUserConfirmedWarning;
  }

  get displayChallenge() {
    if (!this._isTimedChallenge && !this.isFocusedChallenge) {
      return true;
    }

    if (this._isTimedChallenge) {
      if (this.hasUserConfirmedWarning || this.args.answer) return true;
    }

    if (this.isFocusedChallenge) {
      if (this.hasUserConfirmedFocusWarning) {
        this._setOnBlurMethod();
        return true;
      }
      if (this.args.answer) return true;
    }

    return false;
  }

  _setOnBlurMethod() {
    window.onblur = () => {
      this.hasFocusedOut = true;
      this._clearOnBlurMethod();
    };
  }

  _clearOnBlurMethod() {
    window.onblur = null;
  }

  get _isTimedChallenge() {
    return isInteger(this.args.challenge.timer);
  }

  get isFocusedChallenge() {
    return this.args.challenge.focused;
  }

  get isTimedChallengeWithoutAnswer() {
    return this._isTimedChallenge && !this.args.answer;
  }

  get isFocusedChallengeWithoutAnswer() {
    return this.isFocusedChallenge && !this.args.answer;
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
  setUserFocusChallengeConfirmation() {
    this.hasUserConfirmedFocusWarning = true;
  }
}
