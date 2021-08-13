import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import isInteger from 'lodash/isInteger';
import ENV from 'mon-pix/config/environment';

export default class ChallengeItemGeneric extends Component {

  @service currentUser;
  @tracked isValidateButtonEnabled = true;
  @tracked isSkipButtonEnabled = true;
  @tracked hasChallengeTimedOut = false;
  @tracked errorMessage = null;
  @tracked hasFocusedOutOfWindow = false;
  @tracked hasFocusedOutOfChallenge = false;
  @tracked isTooltipClosed = false;

  get displayTimer() {
    return this.isTimedChallengeWithoutAnswer;
  }

  get _isTimedChallenge() {
    return isInteger(this.args.challenge.timer);
  }

  get isFocusedChallenge() {
    return ENV.APP.FT_FOCUS_CHALLENGE_ENABLED && this.args.challenge.focused;
  }

  get hasFocusedOutOfChallengeButNotWindow() {
    return this.hasFocusedOutOfChallenge && !this.hasFocusedOutOfWindow;
  }

  get isAnswerFieldDisabled() {
    if (this.isFocusedChallenge && this.currentUser.user && !this.currentUser.user.hasSeenFocusedChallengeTooltip) {
      return this.args.answer || !this.isTooltipClosed;
    }
    return this.args.answer;
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
  enableFocusedChallenge() {
    this.isTooltipClosed = true;
    this._setOnBlurEventToWindow();
    this.args.onTooltipClose();
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
