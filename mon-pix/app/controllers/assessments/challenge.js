import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';
import Controller from '@ember/controller';

const { and } = computed;

@classic
export default class ChallengeController extends Controller {
  queryParams = ['newLevel', 'competenceLeveled'];
  newLevel = null;
  competenceLeveled = null;

  @and('model.assessment.showLevelup', 'newLevel')
  showLevelup;

  pageTitle = 'Évaluation en cours';
}
