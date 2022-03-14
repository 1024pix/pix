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
  @service focusedCertificationChallengesManager;

  @tracked newLevel = null;
  @tracked competenceLeveled = null;
  @tracked challengeTitle = defaultPageTitle;
  @tracked hasFocusedOutOfChallenge = false;
  @tracked hasFocusedOutOfWindow = this.model.assessment.hasFocusedOutChallenge;
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
    return (
      !this.hasFocusedOutOfWindow &&
      !this.model.answer &&
      this.model.challenge.focused &&
      !this.model.assessment.hasFocusedOutChallenge
    );
  }

  get displayInfoAlertForFocusOut() {
    return this.hasFocusedOutOfChallenge && this.couldDisplayInfoAlert;
  }

  get displayFocusedCertificationChallengeWarning() {
    return this.isFocusedCertificationChallengeWithoutAnswer && !this.hasConfirmedFocusScreenForCurrentChallenge;
  }

  get shouldBlurBanner() {
    return this.model.challenge.focused && !this.hasConfirmedFocusScreenForCurrentChallenge;
  }

  @action
  setFocusedOutOfChallenge(value) {
    this.hasFocusedOutOfChallenge = value;
  }

  @action
  async focusedOutOfWindow() {
    this.hasFocusedOutOfWindow = true;
    this.model.assessment.lastQuestionState = 'focusedout';
    await this.model.assessment.save({ adapterOptions: { updateLastQuestionState: true } });
  }

  get isFocusedCertificationChallengeWithoutAnswer() {
    return this._isFocusedCertificationChallenge && !this.model.answer;
  }

  get hasConfirmedFocusScreenForCurrentChallenge() {
    const challengeId = this.model.challenge.id;
    const hasUserConfirmedFocuseChallenge = this.focusedCertificationChallengesManager.has(challengeId);

    return hasUserConfirmedFocuseChallenge;
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
    this.hasFocusedOutOfChallenge = false;
  }

  @action
  resetAllChallengeInfo() {
    this._resetNonContextualChallengeInfo();
    this.hasFocusedOutOfWindow = false;
    this.model.assessment.lastQuestionState = 'asked';
  }

  @action
  resetChallengeInfoOnResume() {
    this._resetNonContextualChallengeInfo();
    // Keep focused out of window state
    this.hasFocusedOutOfWindow = this.model.assessment.hasFocusedOutChallenge;
  }

  get displayHomeLink() {
    return this.currentUser.user && !this.currentUser.user.isAnonymous;
  }

  get displayChallenge() {
    if (!this._isTimedChallenge && !this._isFocusedCertificationChallenge) {
      return true;
    }

    if (this._isTimedChallenge) {
      if (this.hasUserConfirmedWarning || this.model.answer || this.model.assessment.hasTimeoutChallenge) return true;
    }

    if (this._isFocusedCertificationChallenge) {
      if (this.hasConfirmedFocusScreenForCurrentChallenge) {
        this._subscribeOnBlurEvent();
        return true;
      }
      if (this.model.answer) return true;
    }

    return false;
  }

  _subscribeOnBlurEvent() {
    window.onblur = () => {
      this.hasFocusedOutOfWindow = true;
      this._unsubscribeOnBlurEvent();
    };
  }
  _unsubscribeOnBlurEvent() {
    window.onblur = null;
  }

  get _isTimedChallenge() {
    return isInteger(this.model.challenge.timer);
  }

  get _isFocusedCertificationChallenge() {
    return this.model.assessment.isCertification && this.model.challenge.focused;
  }

  @action
  setUserFocusCertificationChallengeConfirmation() {
    const challengeId = this.model.challenge.id;
    this.focusedCertificationChallengesManager.add(challengeId);
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
