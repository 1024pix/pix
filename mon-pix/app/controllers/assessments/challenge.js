import get from 'lodash/get';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';
import { action } from '@ember/object';
const defaultPageTitle = 'pages.challenge.title';
const timedOutPageTitle = 'pages.challenge.timed-out-title';

export default class ChallengeController extends Controller {
  queryParams = ['newLevel', 'competenceLeveled', 'challengeId'];
  @service intl;
  @service currentUser;
  @tracked newLevel = null;
  @tracked competenceLeveled = null;
  @tracked challengeTitle = defaultPageTitle;
  @tracked hasFocusedOut = false;
  @tracked isTooltipOverlayIsDisplayed = true;

  get showLevelup() {
    return this.model.assessment.showLevelup && this.newLevel;
  }

  get pageTitle() {
    const stepNumber = progressInAssessment.getCurrentStepNumber(this.model.assessment, get(this.model, 'answer.id'));
    const totalChallengeNumber = progressInAssessment.getMaxStepsNumber(this.model.assessment);

    return this.intl.t(this.challengeTitle, { stepNumber, totalChallengeNumber });
  }

  get isFocusedChallengeAndUserHasFocusedOut() {
    return this.model.challenge.focused && this.hasFocusedOut;
  }

  get isFocusedChallengeAndTooltipIsDisplayed() {
    return this.model.challenge.focused && this.isTooltipOverlayIsDisplayed;
  }

  @action
  async removeTooltipOverlay() {
    this.isTooltipOverlayIsDisplayed = false;
    await this.currentUser.user.save({ adapterOptions: { tooltipChallengeType: 'focused' } });
  }

  @action
  focusedIn() {
    this.hasFocusedOut = false;
  }

  @action
  focusedOut() {
    this.hasFocusedOut = true;
  }

  @action
  timeoutChallenge() {
    this.challengeTitle = timedOutPageTitle;
  }

  @action
  finishChallenge() {
    this.challengeTitle = defaultPageTitle;
  }

  get displayHomeLink() {
    return this.currentUser.user && !this.currentUser.user.isAnonymous;
  }
}
