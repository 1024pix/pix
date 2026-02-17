import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import ENV from 'mon-pix/config/environment';

export default class CheckpointController extends Controller {
  queryParams = ['finalCheckpoint', 'newLevel', 'competenceLeveled'];

  @service intl;
  @service currentUser;

  @tracked answer = {};
  @tracked challenge = null;
  @tracked finalCheckpoint = false;
  @tracked isShowingModal = false;
  @tracked newLevel = null;
  @tracked competenceLeveled = null;

  get showLevelup() {
    return this.model.showLevelup && this.newLevel;
  }

  get displayShareResultsBanner() {
    return (
      this.finalCheckpoint &&
      this.model.isForCampaign &&
      new Date(this.model.createdAt) <= new Date(ENV.APP.AUTO_SHARE_AFTER_DATE)
    );
  }

  get nextPageButtonText() {
    return this.finalCheckpoint
      ? this.intl.t('pages.checkpoint.actions.next-page.results')
      : this.intl.t('pages.checkpoint.actions.next-page.continue');
  }

  get completionRate() {
    return this.finalCheckpoint ? 1 : this.model.get('progression.completionRate');
  }

  get shouldDisplayAnswers() {
    return !!this.model.answersSinceLastCheckpoints.length;
  }

  get pageTitle() {
    return this.finalCheckpoint
      ? this.intl.t('pages.checkpoint.title.end-of-assessment')
      : this.intl.t('pages.checkpoint.title.assessment-progress');
  }

  get displayHomeLink() {
    return this.currentUser.user && !this.currentUser.user.isAnonymous;
  }

  @action
  async openComparisonWindow(answer) {
    this.answer = answer;
    await answer.correction;
    this.isShowingModal = true;
  }

  @action
  closeComparisonWindow() {
    this.isShowingModal = false;
  }
}
