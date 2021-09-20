import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';
import { action } from '@ember/object';
const defaultPageTitle = 'pages.challenge.title.default';
const timedOutPageTitle = 'pages.challenge.title.timed-out';
const focusedPageTitle = 'pages.challenge.title.focused';
const focusedOutPageTitle = 'pages.challenge.title.focused-out';
import isInteger from 'lodash/isInteger';

export default class ChallengeController extends Controller {
  queryParams = ['newLevel', 'competenceLeveled', 'challengeId'];
  @service intl;
  @service store;
  @service currentUser;
  @tracked newLevel = null;
  @tracked competenceLeveled = null;
  @tracked challengeTitle = defaultPageTitle;
  @tracked hasFocusedOutOfChallenge = false;
  @tracked hasFocusedOutOfWindow = false;
  @tracked hasUserConfirmedWarning = false;

  get showLevelup() {
    return this.model.assessment.showLevelup && this.newLevel;
  }

  get pageTitle() {
    const stepNumber = progressInAssessment.getCurrentStepNumber(this.model.assessment, this.model.currentChallengeNumber);
    const totalChallengeNumber = progressInAssessment.getMaxStepsNumber(this.model.assessment);

    const title = this.model.challenge.focused ? this._focusedPageTitle() : this.challengeTitle;

    return this.intl.t(title, { stepNumber, totalChallengeNumber });
  }

  _focusedPageTitle() {
    if (this.model.assessment.isCertification && this.hasFocusedOutOfWindow) {
      return focusedOutPageTitle;
    }
    return focusedPageTitle;
  }

  get isFocusedChallengeAndUserHasFocusedOutOfChallenge() {
    return this.model.challenge.focused && this.hasFocusedOutOfChallenge && !this.model.answer;
  }

  get couldDisplayInfoAlert() {
    return !this.hasFocusedOutOfWindow && !this.model.answer && this.model.challenge.focused && !this.model.assessment.hasFocusedOutChallenge;
  }

  get displayInfoAlertForFocusOut() {
    return this.hasFocusedOutOfChallenge && this.couldDisplayInfoAlert;
  }

  @action
  async removeTooltipOverlay() {
    if (this.currentUser.user) {
      if (this.model.challenge.focused && !this.currentUser.user.hasSeenFocusedChallengeTooltip) {
        await this._updateUserAndTriggerOverlayRemoval({ tooltipChallengeType: 'focused' });
      } else if (!this.model.challenge.focused && !this.currentUser.user.hasSeenOtherChallengesTooltip) {
        await this._updateUserAndTriggerOverlayRemoval({ tooltipChallengeType: 'other' });
      }
    }
  }

  async _updateUserAndTriggerOverlayRemoval(tooltipChallengeType) {
    await this.currentUser.user.save({ adapterOptions: tooltipChallengeType });
  }

  @action
  async setFocusedOutOfChallenge(value) {
    this.hasFocusedOutOfChallenge = value;
    if (this.hasFocusedOutOfChallenge) {
      await this.model.assessment.save({ adapterOptions: { updateLastQuestionsState: true, state: 'focusedout' } });
    }
  }

  @action
  focusedOutOfWindow() {
    this.hasFocusedOutOfWindow = true;
  }

  @action
  async timeoutChallenge() {
    this.challengeTitle = timedOutPageTitle;
    await this.model.assessment.save({ adapterOptions: { updateLastQuestionsState: true, state: 'timeout' } });
  }

  @action
  resetChallengeInfo() {
    this.challengeTitle = defaultPageTitle;
    this.hasUserConfirmedWarning = false;
    this.hasFocusedOutOfChallenge = false;
    this.hasFocusedOutOfWindow = false;
    this.model.assessment.lastQuestionState = 'asked';
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
    return this.isTimedChallengeWithoutAnswer && !this.hasUserConfirmedWarning && !this.model.assessment.hasTimeoutChallenge;
  }
}
