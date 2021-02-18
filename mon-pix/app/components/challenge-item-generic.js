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
  _pageBeforeUnloadListener = null;
  _pageUnloadListener = null;
  _hasAnswerBeenRecorded = false;

  constructor() {
    super(...arguments);
    if (!this.isTimedChallenge) {
      this._start();
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this._removeEventListeners();
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
    if (this.isTimedChallenge) {
      if (this.hasChallengeTimedOut) {
        return -1 ;
      } else {
        return this.args.challenge.timer - this._elapsedTime;
      }
    } else {
      return null;
    }
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
      this._hasAnswerBeenRecorded = true;

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
      this._hasAnswerBeenRecorded = true;

      return this.args.answerValidated(this.args.challenge, this.args.assessment, '#ABAND#', this._getTimeout(), this._elapsedTime)
        .finally(() => this.isSkipButtonEnabled = true);
    }
  }

  @action
  setUserConfirmation() {
    this._start();
    this.hasUserConfirmedWarning = true;
    this._addQuitTimedChallengeListeners();
  }

  _addQuitTimedChallengeListeners() {
    this._pageBeforeUnloadListener = (event) => {
      event.preventDefault();
    };
    this._pageUnloadListener = (event) => {
      event.preventDefault();
      if (!this._hasAnswerBeenRecorded) {
        this.skipChallenge();
      }
    };
    window.addEventListener('beforeunload', this._pageBeforeUnloadListener);
    window.addEventListener('unload', this._pageUnloadListener);
  }

  _removeEventListeners() {
    if (this._pageBeforeUnloadListener) {
      window.removeEventListener('beforeunload', this._pageBeforeUnloadListener);
    }
    if (this._pageUnloadListener) {
      window.removeEventListener('unload', this._pageUnloadListener);
    }
  }
}
