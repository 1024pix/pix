import _ from 'lodash';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';

export default class ChallengeController extends Controller {
  queryParams = ['newLevel', 'competenceLeveled'];
  @tracked newLevel = null;
  @tracked competenceLeveled = null;

  get showLevelup() {
    return this.model.assessment.showLevelup && this.newLevel;
  }

  get pageTitle() {
    const challengeText = 'Épreuve';
    const outOfText = 'sur';
    const stepNumber = progressInAssessment.getCurrentStepNumber(this.model.assessment, _.get(this.model, 'answer.id'));
    const totalChallengeNumber = progressInAssessment.getMaxStepsNumber(this.model.assessment);

    return `${challengeText} ${stepNumber} ${outOfText} ${totalChallengeNumber}`;
  }
}
