import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';
import { action } from '@ember/object';
const defaultPageTitle = 'pages.challenge.title.default';
const timedOutPageTitle = 'pages.challenge.title.timed-out';
const focusedPageTitle = 'pages.challenge.title.focused';
const focusedOutPageTitle = 'pages.challenge.title.focused-out';
import ENV from 'mon-pix/config/environment';
import isInteger from 'lodash/isInteger';

export default class ChallengeController extends Controller {
  queryParams = ['newLevel', 'competenceLeveled', 'challengeId'];
  @service intl;
  @service currentUser;
  @tracked newLevel = null;
  @tracked competenceLeveled = null;
  @tracked challengeTitle = defaultPageTitle;
  @tracked hasFocusedOutOfChallenge = false;
  @tracked hasFocusedOutOfWindow = false;
  @tracked isTooltipOverlayDisplayed = !(this.currentUser.user && this.currentUser.user.hasSeenFocusedChallengeTooltip)
  @tracked hasUserConfirmedWarning = false;

  get showLevelup() {
    return this.model.assessment.showLevelup && this.newLevel;
  }

  get pageTitle() {
    const stepNumber = progressInAssessment.getCurrentStepNumber(this.model.assessment, this.model.currentChallengeNumber);
    const totalChallengeNumber = progressInAssessment.getMaxStepsNumber(this.model.assessment);
    const title = this.model.challenge.focused ? focusedPageTitle : this.challengeTitle;

    return this.intl.t(title, { stepNumber, totalChallengeNumber });
  }

  get isFocusedChallengeAndUserHasFocusedOutOfChallenge() {
    return this.model.challenge.focused && this.hasFocusedOutOfChallenge && !this.model.answer;
  }

  get couldDisplayInfoAlert() {
    return !this.hasFocusedOutOfWindow && !this.model.answer && this.model.challenge.focused;
  }

  get displayInfoAlertForFocusOut() {
    return this.hasFocusedOutOfChallenge && this.couldDisplayInfoAlert;
  }

  get isFocusedChallengeAndTooltipIsDisplayed() {
    if (ENV.APP.FT_FOCUS_CHALLENGE_ENABLED) {
      return this.model.challenge.focused && this.isTooltipOverlayDisplayed && this.currentUser.user && !this.currentUser.user.hasSeenFocusedChallengeTooltip;
    }
    return false;
  }

  @action
  async removeTooltipOverlay() {
    if (this.currentUser.user && !this.currentUser.user.hasSeenFocusedChallengeTooltip) {
      this.isTooltipOverlayDisplayed = false;
      await this.currentUser.user.save({ adapterOptions: { tooltipChallengeType: 'focused' } });
    }
  }

  @action
  setFocusedOutOfChallenge(value) {
    this.hasFocusedOutOfChallenge = value;
  }

  @action
  focusedOutOfWindow() {
    this.hasFocusedOutOfWindow = true;

    if (this.model.challenge.focused && this.model.assessment.isCertification) {
      this.challengeTitle = focusedOutPageTitle;
    }
  }

  @action
  timeoutChallenge() {
    this.challengeTitle = timedOutPageTitle;
  }

  @action
  resetChallengeInfo() {
    this.challengeTitle = defaultPageTitle;
    this.hasUserConfirmedWarning = false;
    this.hasFocusedOutOfChallenge = false;
    this.hasFocusedOutOfWindow = false;
  }

  get displayHomeLink() {
    return this.currentUser.user && !this.currentUser.user.isAnonymous;
  }

  get displayChallenge() {
    if (!this._isTimedChallenge) {
      return true;
    }

    if (this._isTimedChallenge) {
      if (this.hasUserConfirmedWarning || this.model.answer) return true;
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
    return this.isTimedChallengeWithoutAnswer && !this.hasUserConfirmedWarning;
  }
}
