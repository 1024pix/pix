import { action } from '@ember/object';
import { cancel, later } from '@ember/runloop';
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
  @tracked _elapsedTime = null;

  _timer = null;

  constructor() {
    super(...arguments);
    if (!this.isTimedChallenge) {
      this._start();
    }
  }

  cancelTimer() {
    cancel(this._timer);
  }

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
    if (!this.isTimedChallenge) {
      return null;
    }
    return this.args.challenge.timer - this._elapsedTime;
  }

  _start() {
    this._elapsedTime = 0;
    this._tick();
  }

  _tick() {
    if (ENV.APP.isChallengeTimerEnable) {
      const timer = later(this, function() {
        const elapsedTime = this._elapsedTime;
        this._elapsedTime = elapsedTime + 1;
        if ((this._elapsedTime - this.args.challenge.timer) >= 0) {
          this.hasChallengeTimedOut = true;
        } else {
          this._tick();
        }
      }, 1000);

      this._timer = timer;
    }
  }

  @action
  validateAnswer() {
    if (this.isValidateButtonEnabled && this.isSkipButtonEnabled) {

      if (this._hasError() && !this.hasChallengeTimedOut) {
        const errorMessage = this._getErrorMessage();
        this.errorMessage = errorMessage;
        return;
      }

      this.errorMessage = null;
      this.hasUserConfirmedWarning = false;
      this.isValidateButtonEnabled = false;

      return this.args.answerValidated(this.args.challenge, this.args.assessment, this._getAnswerValue(), this._getTimeout(), this._elapsedTime)
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
      this.hasUserConfirmedWarning = false;
      this.isSkipButtonEnabled = false;

      return this.args.answerValidated(this.args.challenge, this.args.assessment, '#ABAND#', this._getTimeout(), this._elapsedTime)
        .finally(() => this.isSkipButtonEnabled = true);
    }
  }

  @action
  setUserConfirmation() {
    this._start();
    this.hasUserConfirmedWarning = true;
  }
}
