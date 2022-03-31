import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';
import { action } from '@ember/object';
const defaultPageTitle = 'pages.challenge.title.default';
const timedOutPageTitle = 'pages.challenge.title.timed-out';
import isInteger from 'lodash/isInteger';

export default class ChallengeController extends Controller {
  queryParams = ['newLevel', 'competenceLeveled', 'challengeId'];
  @service intl;
  @service store;
  @service currentUser;
  @tracked newLevel = null;
  @tracked competenceLeveled = null;
  @tracked challengeTitle = defaultPageTitle;
  @tracked hasUserConfirmedWarning = false;

  get showLevelup() {
    return this.model.assessment.showLevelup && this.newLevel;
  }

  get pageTitle() {
    const stepNumber = progressInAssessment.getCurrentStepNumber(
      this.model.assessment,
      this.model.currentChallengeNumber
    );
    const totalChallengeNumber = progressInAssessment.getMaxStepsNumber(this.model.assessment);

    const title = this.challengeTitle;

    return this.intl.t(title, { stepNumber, totalChallengeNumber });
  }

  @action
  async timeoutChallenge() {
    this.challengeTitle = timedOutPageTitle;
    this.model.assessment.lastQuestionState = 'timeout';
    await this.model.assessment.save({ adapterOptions: { updateLastQuestionState: true } });
  }

  _resetNonContextualChallengeInfo() {
    this.challengeTitle = defaultPageTitle;
    this.hasUserConfirmedWarning = false;
  }

  @action
  resetAllChallengeInfo() {
    this._resetNonContextualChallengeInfo();
    this.model.assessment.lastQuestionState = 'asked';
  }

  @action
  resetChallengeInfoOnResume() {
    this._resetNonContextualChallengeInfo();
  }

  get displayHomeLink() {
    return this.currentUser.user && !this.currentUser.user.isAnonymous;
  }

  get displayChallenge() {
    if (!this._isTimedChallenge) {
      return true;
    }

    if (this._isTimedChallenge) {
      if (this.hasUserConfirmedWarning || this.model.answer || this.model.assessment.hasTimeoutChallenge) return true;
    }

    return false;
  }

  get _isTimedChallenge() {
    return isInteger(this.model.challenge.timer);
  }

  @action
  setUserConfirmation() {
    this.hasUserConfirmedWarning = true;
  }

  get isTimedChallengeWithoutAnswer() {
    return this._isTimedChallenge && !this.model.answer;
  }

  get displayTimedChallengeInstructions() {
    return (
      this.isTimedChallengeWithoutAnswer && !this.hasUserConfirmedWarning && !this.model.assessment.hasTimeoutChallenge
    );
  }
}
