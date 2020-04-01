import Controller from '@ember/controller';
import { computed } from '@ember/object';

const { and } = computed;

export default Controller.extend({
  queryParams: ['newLevel', 'competenceLeveled'],

  newLevel: null,
  competenceLeveled: null,

  showLevelup: and('model.assessment.showLevelup', 'newLevel'),
  pageTitle: 'Évaluation en cours',
});
