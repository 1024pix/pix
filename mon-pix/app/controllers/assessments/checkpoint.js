import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class CheckpointController extends Controller {
  queryParams = ['finalCheckpoint', 'newLevel', 'competenceLeveled'];

  @service intl;
  @service currentUser;

  @tracked answer = null;
  @tracked challenge = null;
  @tracked finalCheckpoint = false;
  @tracked isShowingModal = false;
  @tracked newLevel = null;
  @tracked competenceLeveled = null;

  get showLevelup() {
    return this.model.showLevelup && this.newLevel;
  }

  get nextPageButtonText() {
    return this.finalCheckpoint ? this.intl.t('pages.checkpoint.actions.next-page.results') : this.intl.t('pages.checkpoint.actions.next-page.continue');
  }

  get completionPercentage() {
    return this.finalCheckpoint ? 100 : this.model.get('progression.completionPercentage');
  }

  get shouldDisplayAnswers() {
    return !!this.model.answersSinceLastCheckpoints.length;
  }

  get pageTitle() {
    return this.finalCheckpoint ? this.intl.t('pages.checkpoint.title.end-of-assessment') : this.intl.t('pages.checkpoint.title.assessment-progress');
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
