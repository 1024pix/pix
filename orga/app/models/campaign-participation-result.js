import DS from 'ember-data';
import { computed } from '@ember/object';


export default DS.Model.extend({

  totalSkillsCount: DS.attr('number'),
  testedSkillsCount: DS.attr('number'),
  validatedSkillsCount: DS.attr('number'),
  isCompleted: DS.attr('boolean'),

  percentageProgression: computed('totalSkillsCount', 'testedSkillsCount', 'isCompleted', function () {
    if(this.get('isCompleted')) {
      return 100;
    }
    return (this.get('testedSkillsCount')*100)/this.get('totalSkillsCount');
  }),
  percentageResult: computed('totalSkillsCount', 'validatedSkillsCount', function () {
    return (this.get('validatedSkillsCount')*100)/this.get('totalSkillsCount');
  }),

});
