import DS from 'ember-data';
import { computed } from '@ember/object';
const { belongsTo, Model, attr } = DS;

export default Model.extend({
  areaCode: attr('string'),
  areaColor: attr('string'),
  competenceName: attr('string'),
  competenceId: attr('string'),
  averageValidatedSkills: attr('number'),
  totalSkillsCount: attr('number'),
  campaignCollectiveResult: belongsTo('campaign-collective-result'),

  roundedAverageValidatedSkills: computed('averageValidatedSkills', function() {
    return Math.round(this.averageValidatedSkills * 10) / 10;
  }),

  validatedSkillsPercentage: computed('averageValidatedSkills', 'totalSkillsCount', function() {
    return Math.round(this.averageValidatedSkills * 100 / this.totalSkillsCount);
  }),

  totalSkillsCountPercentage: computed('totalSkillsCount', 'campaignCollectiveResult.maxTotalSkillsCountInCompetences', function() {
    return Math.round(this.totalSkillsCount * 100 / this.campaignCollectiveResult.get('maxTotalSkillsCountInCompetences'));
  }),

});
