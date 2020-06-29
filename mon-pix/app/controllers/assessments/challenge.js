import _ from 'lodash';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ChallengeController extends Controller {
  queryParams = ['newLevel', 'competenceLeveled'];
  @tracked newLevel = null;
  @tracked competenceLeveled = null;
  @service progressInAssessment;

  get showLevelup() {
    return this.model.assessment.showLevelup && this.newLevel;
  }

  get pageTitle() {
    const challengeText = 'Épreuve';
    const outOfText = 'sur';
    const stepNumber = this.progressInAssessment.getCurrentStepNumber(this.model.assessment, _.get(this.model, 'answer.id'));
    const totalChallengeNumber = this.progressInAssessment.getMaxStepsNumber(this.model.assessment);

    return `${challengeText} ${stepNumber} ${outOfText} ${totalChallengeNumber}`;
  }
}
