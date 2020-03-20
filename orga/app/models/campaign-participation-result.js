import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({

  totalSkillsCount: DS.attr('number'),
  testedSkillsCount: DS.attr('number'),
  validatedSkillsCount: DS.attr('number'),
  isCompleted: DS.attr('boolean'),
  competenceResults: DS.hasMany('competenceResult'),
  progress: DS.attr('number'),

  totalSkillsCounts: computed.mapBy('competenceResults', 'totalSkillsCount'),
  maxTotalSkillsCountInCompetences: computed.max('totalSkillsCounts'),

  masteryPercentage: computed('totalSkillsCount', 'validatedSkillsCount', function() {
    return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
  }),
});
