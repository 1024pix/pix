import get from 'lodash/get';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';

export default class ChallengeController extends Controller {
  queryParams = ['newLevel', 'competenceLeveled'];
  @service intl;
  @service currentUser;
  @tracked newLevel = null;
  @tracked competenceLeveled = null;

  get showLevelup() {
    return this.model.assessment.showLevelup && this.newLevel;
  }

  get pageTitle() {
    const stepNumber = progressInAssessment.getCurrentStepNumber(this.model.assessment, get(this.model, 'answer.id'));
    const totalChallengeNumber = progressInAssessment.getMaxStepsNumber(this.model.assessment);

    return this.intl.t('pages.challenge.title', { stepNumber, totalChallengeNumber });
  }

  get displayHomeLink() {
    return this.currentUser.user && !this.currentUser.user.isAnonymous;
  }
}
