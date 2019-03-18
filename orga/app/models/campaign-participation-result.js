import DS from 'ember-data';
import { computed } from '@ember/object';


export default DS.Model.extend({

  totalSkillsCount: DS.attr('number'),
  testedSkillsCount: DS.attr('number'),
  validatedSkillsCount: DS.attr('number'),
  isCompleted: DS.attr('boolean'),

  percentageProgression: computed('totalSkillsCount', 'testedSkillsCount', 'isCompleted', function () {
    if(this.isCompleted) {
      return 100;
    }

    return Math.round(this.testedSkillsCount * 100 / this.totalSkillsCount);
  }),

});
