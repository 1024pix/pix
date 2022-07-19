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
  @service focusedCertificationChallengeWarningManager;

  @tracked newLevel = null;
  @tracked competenceLeveled = null;
  @tracked challengeTitle = defaultPageTitle;
  @tracked hasFocusedOutOfChallenge = false;
  @tracked hasUserConfirmedTimedChallengeWarning = false;

  get showLevelup() {
    return this.model.assessment.showLevelup && this.newLevel;
  }

  get hasFocusedOutOfWindow() {
    return this.model.assessment.hasFocusedOutChallenge;
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
    return this.isFocusedCertificationChallengeWithoutAnswer && !this.hasConfirmedFocusChallengeWarningScreen;
  }

  get shouldBlurBanner() {
    return this.model.challenge.focused && !this.hasConfirmedFocusChallengeWarningScreen;
  }

  @action
  setFocusedOutOfChallenge(value) {
    this.hasFocusedOutOfChallenge = value;
  }

  @action
  async focusedOutOfWindow() {
    this.model.assessment.lastQuestionState = 'focusedout';
    await this.model.assessment.save({
      adapterOptions: {
        updateLastQuestionState: true,
        challengeId: this.model.challenge.id,
      },
    });
  }

  get isFocusedCertificationChallengeWithoutAnswer() {
    return this._isFocusedCertificationChallenge && !this.model.answer;
  }

  get hasConfirmedFocusChallengeWarningScreen() {
    const hasUserConfirmedFocusChallenge = this.focusedCertificationChallengeWarningManager.hasConfirmed();
    return hasUserConfirmedFocusChallenge;
  }

  @action
  async timeoutChallenge() {
    this.challengeTitle = timedOutPageTitle;
    this.model.assessment.lastQuestionState = 'timeout';
    await this.model.assessment.save({ adapterOptions: { updateLastQuestionState: true } });
  }

  _resetNonContextualChallengeInfo() {
    this.challengeTitle = defaultPageTitle;
    this.hasUserConfirmedTimedChallengeWarning = false;
    this.hasFocusedOutOfChallenge = false;
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
    if (!this._isFocusedCertificationChallenge) {
      this.focusedCertificationChallengeWarningManager.reset();
    }

    if (this._hasAlreadyAnswered()) {
      return true;
    }

    if (this._isTimedChallenge) {
      if (this.hasUserConfirmedTimedChallengeWarning || this.model.assessment.hasTimeoutChallenge) return true;
    }

    if (this._isFocusedCertificationChallenge) {
      if (this._hasCertificationCandidateConfirmedFocusWarningScreen()) return true;
    }

    if (!this._isFocusedCertificationChallenge && !this._isTimedChallenge) {
      return true;
    }

    return false;
  }

  get _isTimedChallenge() {
    return isInteger(this.model.challenge.timer);
  }

  get _isFocusedCertificationChallenge() {
    return this.model.assessment.isCertification && this.model.challenge.focused;
  }

  @action
  setUserFocusCertificationChallengeConfirmation() {
    this.focusedCertificationChallengeWarningManager.setToConfirmed();
  }

  @action
  setUserTimedChallengeConfirmation() {
    this.hasUserConfirmedTimedChallengeWarning = true;
  }

  get isTimedChallengeWithoutAnswer() {
    return this._isTimedChallenge && !this.model.answer;
  }

  get displayTimedChallengeInstructions() {
    return (
      this.isTimedChallengeWithoutAnswer &&
      !this.hasUserConfirmedTimedChallengeWarning &&
      !this.model.assessment.hasTimeoutChallenge
    );
  }

  _hasCertificationCandidateConfirmedFocusWarningScreen() {
    return this.model.assessment.isCertification && this.hasConfirmedFocusChallengeWarningScreen;
  }

  _hasAlreadyAnswered() {
    return this.model.answer;
  }
}
