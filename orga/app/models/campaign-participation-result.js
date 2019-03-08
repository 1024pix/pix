import DS from 'ember-data';
import { computed } from '@ember/object';


export default DS.Model.extend({

  totalSkills: DS.attr('number'),
  testedSkills: DS.attr('number'),
  validatedSkills: DS.attr('number'),
  isCompleted: DS.attr('boolean'),

  percentageProgression: computed('totalSkills', 'testedSkills', function () {
    return (this.get('testedSkills')*100)/this.get('totalSkills');
  }),
  percentageResult: computed('totalSkills', 'validatedSkills', function () {
    return (this.get('validatedSkills')*100)/this.get('totalSkills');
  }),

});
