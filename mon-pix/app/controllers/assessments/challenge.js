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
  @service progressInEvaluation;

  @and('model.assessment.showLevelup', 'newLevel')
  showLevelup;

  @computed('model.{assessment,answer}')
  get pageTitle() {
    return `Épreuve ${this.progressInEvaluation.getCurrentStepIndex(this.model.assessment, _.get(this.model, 'answer.id')) + 1} sur ${this.progressInEvaluation.getMaxStepsNumber(this.model.assessment)}`;
  }
}
