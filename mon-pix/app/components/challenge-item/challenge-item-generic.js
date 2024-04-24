import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import isInteger from 'lodash/isInteger';

export default class ChallengeItemGeneric extends Component {
  @service currentUser;
  @tracked hasChallengeTimedOut = this.args.assessment.hasTimeoutChallenge || false;
  @tracked errorMessage = null;

  get displayTimer() {
    return this.isTimedChallengeWithoutAnswer;
  }

  get _isTimedChallenge() {
    return isInteger(this.args.challenge.timer);
  }

  get isAnswerFieldDisabled() {
    return !!this.args.answer;
  }

  get isTimedChallengeWithoutAnswer() {
    return this._isTimedChallenge && !this.args.answer;
  }

  _getTimeout() {
    if (this._isTimedChallenge) {
      if (this.hasChallengeTimedOut) {
        return -1;
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

    return this.args
      .answerValidated(
        this.args.challenge,
        this.args.assessment,
        this._getAnswerValue(),
        this._getTimeout(),
        this.args.hasFocusedOutOfWindow,
      )
      .finally(() => {
        this.args.resetAllChallengeInfo();
      });
  }

  @action
  resumeAssessment() {
    this.args.resetChallengeInfoOnResume();
    return this.args.resumeAssessment(this.args.assessment);
  }

  @action
  skipChallenge() {
    this.errorMessage = null;
    return this.args
      .answerValidated(
        this.args.challenge,
        this.args.assessment,
        '#ABAND#',
        this._getTimeout(),
        this.args.hasFocusedOutOfWindow,
      )
      .finally(() => {
        this.args.resetAllChallengeInfo();
      });
  }
}
