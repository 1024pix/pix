import Model, { attr, hasMany } from '@ember-data/model';
import { mapBy, max } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Model.extend({

  totalSkillsCount: attr('number'),
  testedSkillsCount: attr('number'),
  validatedSkillsCount: attr('number'),
  competenceResults: hasMany('competenceResult'),

  totalSkillsCounts: mapBy('competenceResults', 'totalSkillsCount'),
  maxTotalSkillsCountInCompetences: max('totalSkillsCounts'),

  masteryPercentage: computed('totalSkillsCount', 'validatedSkillsCount', function() {
    return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
  }),
});
