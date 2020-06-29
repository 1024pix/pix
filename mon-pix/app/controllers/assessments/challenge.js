import _ from 'lodash';
import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

const { and } = computed;

@classic
export default class ChallengeController extends Controller {
  queryParams = ['newLevel', 'competenceLeveled'];
  newLevel = null;
  competenceLeveled = null;
  @service progressInAssessment;

  @and('model.assessment.showLevelup', 'newLevel')
  showLevelup;

  @computed('model.{assessment,answer}')
  get pageTitle() {
    const challengeText = 'Épreuve';
    const outOfText = 'sur';
    const stepNumber = this.progressInAssessment.getCurrentStepNumber(this.model.assessment, _.get(this.model, 'answer.id'));
    const totalChallengeNumber = this.progressInAssessment.getMaxStepsNumber(this.model.assessment);

    return `${challengeText} ${stepNumber} ${outOfText} ${totalChallengeNumber}`;
  }
}
