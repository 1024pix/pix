import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import isInteger from 'lodash/isInteger';

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
    if (this.args.isFocusedChallenge && this.currentUser.user && !this.currentUser.user.hasSeenFocusedChallengeTooltip) {
      return this.args.answer || !this.args.isTooltipClosed;
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
  setChallengeAsTimedOut() {
    this.hasChallengeTimedOut = true;
    this.args.timeoutChallenge();
  }

  @action
  validateAnswer(event) {
    event.preventDefault();

    if (this._hasError() && !this.hasChallengeTimedOut) {
      const errorMessage = this._getErrorMessage();
      this.errorMessage = errorMessage;
      return;
    }

    this.errorMessage = null;

    return this.args.answerValidated(this.args.challenge, this.args.assessment, this._getAnswerValue(), this._getTimeout())
      .finally(() => {
        this.args.finishChallenge();
      });
  }

  @action
  resumeAssessment() {
    return this.args.resumeAssessment(this.args.assessment);
  }

  @action
  skipChallenge() {
    this.errorMessage = null;

    return this.args.answerValidated(this.args.challenge, this.args.assessment, '#ABAND#', this._getTimeout())
      .finally(() => {
        this.args.finishChallenge();
      });
  }
}
