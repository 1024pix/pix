import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import isInteger from 'lodash/isInteger';

export default class ChallengeItemGeneric extends Component {

  @tracked isValidateButtonEnabled = true;
  @tracked isSkipButtonEnabled = true;
  @tracked hasUserConfirmedWarning = false;
  @tracked hasChallengeTimedOut = false;
  @tracked errorMessage = null;

  get isTimedChallenge() {
    return isInteger(this.args.challenge.timer);
  }

  get displayTimer() {
    return this.isTimedChallengeWithoutAnswer && this.hasUserConfirmedWarning;
  }

  get displayChallenge() {
    return !this.isTimedChallenge || this._hasSeenWarningPage || !this.isTimedChallengeWithoutAnswer;
  }

  get isTimedChallengeWithoutAnswer() {
    if (this.isTimedChallenge && !this.args.answer) {
      return true;
    }
    return false;
  }

  get _hasSeenWarningPage() {
    return this.hasUserConfirmedWarning && this.isTimedChallenge;
  }

  _getTimeout() {
    if (this.isTimedChallenge) {
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
    this.args.timedoutChallenge();
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
        .finally(() => this.isValidateButtonEnabled = true);
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
        .finally(() => this.isSkipButtonEnabled = true);
    }
  }

  @action
  setUserConfirmation() {
    this.hasUserConfirmedWarning = true;
  }
}
