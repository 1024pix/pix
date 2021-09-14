import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import isInteger from 'lodash/isInteger';
import ENV from 'mon-pix/config/environment';

export default class ChallengeItemGeneric extends Component {

  @service currentUser;
  @tracked hasChallengeTimedOut = false;
  @tracked errorMessage = null;

  get displayTimer() {
    return this.isTimedChallengeWithoutAnswer;
  }

  get _isTimedChallenge() {
    return isInteger(this.args.challenge.timer);
  }

  get isAnswerFieldDisabled() {
    if (ENV.APP.FT_FOCUS_CHALLENGE_ENABLED) {
      if (this.args.isFocusedChallenge && this._hasUserNotSeenFocusedChallengeTooltip()
        || !this.args.isFocusedChallenge && this._hasUserNotSeenOtherChallengesTooltip()) {
        return this.args.answer || !this.args.isTooltipClosed;
      }
    }
    return this.args.answer;
  }

  _hasUserNotSeenFocusedChallengeTooltip() {
    return this.args.isFocusedChallenge && this.currentUser.user && !this.currentUser.user.hasSeenFocusedChallengeTooltip;
  }
  _hasUserNotSeenOtherChallengesTooltip() {
    return !this.args.isFocusedChallenge && this.currentUser.user && !this.currentUser.user.hasSeenOtherChallengesTooltip;
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
  setChallengeAsTimedOut() {
    this.hasChallengeTimedOut = true;
    this.args.timeoutChallenge();
  }

  @action
  validateAnswer(event) {
    event.preventDefault();

    if (this._hasError() && !this.hasChallengeTimedOut) {
      this.errorMessage = this._getErrorMessage();
      return;
    }

    this.errorMessage = null;

    return this.args.answerValidated(this.args.challenge, this.args.assessment, this._getAnswerValue(), this._getTimeout(), this.args.hasFocusedOutOfWindow)
      .finally(() => {
        this.args.resetChallengeInfo();
      });
  }

  @action
  resumeAssessment() {
    this.args.resetChallengeInfo();
    return this.args.resumeAssessment(this.args.assessment);
  }

  @action
  skipChallenge() {
    this.errorMessage = null;
    return this.args.answerValidated(this.args.challenge, this.args.assessment, '#ABAND#', this._getTimeout(), this.args.hasFocusedOutOfWindow)
      .finally(() => {
        this.args.resetChallengeInfo();
      });
  }
}
