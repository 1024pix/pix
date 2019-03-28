import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({

  totalSkillsCount: DS.attr('number'),
  testedSkillsCount: DS.attr('number'),
  validatedSkillsCount: DS.attr('number'),
  isCompleted: DS.attr('boolean'),
  competenceResults: DS.hasMany('competenceResult'),

  totalSkillsCounts: computed.mapBy('competenceResults', 'totalSkillsCount'),
  maxTotalSkillsCountInCompetences: computed.max('totalSkillsCounts'),

  percentageProgression: computed('totalSkillsCount', 'testedSkillsCount', 'isCompleted', function() {
    if (this.isCompleted) {
      return 100;
    }

    return Math.round(this.testedSkillsCount * 100 / this.totalSkillsCount);
  }),

  masteryPercentage: computed('totalSkillsCount', 'validatedSkillsCount', function() {
    return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
  }),
});
