import DS from 'ember-data';
import { computed } from '@ember/object';
import _ from 'lodash';

export default DS.Model.extend({

  campaignCompetenceCollectiveResults: DS.hasMany('campaignCompetenceCollectiveResult'),

  // -- Computed properties --

  maxTotalSkillsCountInCompetences: computed('campaignCompetenceCollectiveResults.@each.totalSkillsCount', function() {
    return _.maxBy(this.campaignCompetenceCollectiveResults.toArray(), 'totalSkillsCount').totalSkillsCount;
  }),

  averageValidatedSkillsSum: computed('campaignCompetenceCollectiveResults.@each.averageValidatedSkills', function() {
    return  _.sumBy(this.campaignCompetenceCollectiveResults.toArray(), 'averageValidatedSkills');
  }),

  totalSkills: computed('campaignCompetenceCollectiveResults.@each.totalSkillsCount', function() {
    return _.sumBy(this.campaignCompetenceCollectiveResults.toArray(), 'totalSkillsCount');
  }),

  averageResult: computed('averageValidatedSkillsSum', 'totalSkills', function() {
    return Math.round(this.averageValidatedSkillsSum * 100 / this.totalSkills);
  }),
});
