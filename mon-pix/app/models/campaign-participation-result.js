import DS from 'ember-data';
import { mapBy, max } from '@ember/object/computed';

export default DS.Model.extend({

  totalSkillsCount: DS.attr('number'),
  testedSkillsCount: DS.attr('number'),
  validatedSkillsCount: DS.attr('number'),
  competenceResults: DS.hasMany('competenceResult'),

  totalSkillsCounts: mapBy('competenceResults', 'totalSkillsCount'),
  maxTotalSkillsCountInCompetences: max('totalSkillsCounts'),
});
