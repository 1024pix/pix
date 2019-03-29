import { mapBy, max } from '@ember/object/computed';
import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({

  totalSkillsCount: DS.attr('number'),
  testedSkillsCount: DS.attr('number'),
  validatedSkillsCount: DS.attr('number'),
  competenceResults: DS.hasMany('competenceResult'),

  totalSkillsCounts: mapBy('competenceResults', 'totalSkillsCount'),
  maxTotalSkillsCountInCompetences: max('totalSkillsCounts'),

  masteryPercentage: computed('totalSkillsCount', 'validatedSkillsCount', function() {
    return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
  }),
});
