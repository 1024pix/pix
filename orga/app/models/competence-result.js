import DS from 'ember-data';
import { computed } from '@ember/object';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
  name: attr('string'),
  index: attr('string'),
  areaColor: attr('string'),
  totalSkillsCount: attr('number'),
  testedSkillsCount: attr('number'),
  validatedSkillsCount: attr('number'),
  campaignParticipationResult: belongsTo('campaignParticipationResult'),

  totalSkillsCountPercentage: computed('totalSkillsCount', 'campaignParticipationResult.maxTotalSkillsCountInCompetences', function() {
    return Math.round(this.totalSkillsCount * 100 / this.campaignParticipationResult.get('maxTotalSkillsCountInCompetences'));
  }),

  validatedSkillsPercentage: computed('validatedSkillsCount', 'totalSkillsCount', function() {
    return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
  }),

});
