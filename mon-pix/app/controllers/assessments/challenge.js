import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';

const defaultPageTitle = 'pages.challenge.title.default';
const timedOutPageTitle = 'pages.challenge.title.timed-out';
const focusedPageTitle = 'pages.challenge.title.focused';
const focusedOutPageTitle = 'pages.challenge.title.focused-out';
import isInteger from 'lodash/isInteger';
import ENV from 'mon-pix/config/environment';

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
  @tracked isTextToSpeechActivated = true;

  get showLevelup() {
    return this.model.assessment.showLevelup && this.newLevel;
  }

  get hasFocusedOutOfWindow() {
    return this.model.assessment.hasFocusedOutChallenge;
  }

  get pageTitle() {
    const stepNumber = progressInAssessment.getCurrentStepNumber(
      this.model.assessment,
      this.model.currentChallengeNumber,
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

  get isFocusedChallenge() {
    return ENV.APP.FT_FOCUS_CHALLENGE_ENABLED && this.model.challenge.focused;
  }

  @action
  hideOutOfFocusBorder() {
    if (this.isFocusedChallenge) {
      this.setFocusedOutOfChallenge(false);
    }
  }

  @action
  showOutOfFocusBorder(event) {
    if (this.isFocusedChallenge && !this.model.answer) {
      // linked to a Firefox issue where the mouseleave is triggered
      // when hovering the select options on mouse navigation
      // see: https://stackoverflow.com/questions/46831247/select-triggers-mouseleave-event-on-parent-element-in-mozilla-firefox
      if (this.shouldPreventFirefoxSelectMouseLeaveBehavior(event)) {
        return;
      }
      this.setFocusedOutOfChallenge(true);
    }
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

  shouldPreventFirefoxSelectMouseLeaveBehavior(event) {
    return event.relatedTarget === null;
  }

  get isFocusedCertificationChallengeWithoutAnswer() {
    return this._isFocusedCertificationChallenge && !this.model.answer;
  }

  get hasConfirmedFocusChallengeWarningScreen() {
    return this.focusedCertificationChallengeWarningManager.hasConfirmed;
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

  @action
  async submitLiveAlert() {
    const adapter = this.store.adapterFor('assessment');
    await adapter.createLiveAlert(this.model.assessment.id, this.model.challenge.id);
    await this.model.assessment.reload();
  }

  _hasCertificationCandidateConfirmedFocusWarningScreen() {
    return this.model.assessment.isCertification && this.hasConfirmedFocusChallengeWarningScreen;
  }

  _hasAlreadyAnswered() {
    return this.model.answer;
  }

  @action toggleTextToSpeech() {
    this.isTextToSpeechActivated = !this.isTextToSpeechActivated;
    if (!this.isTextToSpeechActivated) {
      speechSynthesis.cancel();
    }
  }
}
