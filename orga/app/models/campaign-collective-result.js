import DS from 'ember-data';
import { computed } from '@ember/object';
import _ from 'lodash';

export default DS.Model.extend({
  campaignCollectiveResult: DS.belongsTo('campaign-collective-result'),
  totalValidatedSkills: computed.mapBy('campaignCompetenceCollectiveResults', 'totalValidatedSkills'),

  campaignCompetenceCollectiveResults: DS.hasMany('campaignCompetenceCollectiveResult'),

  totalSkillsCounts: computed.mapBy('campaignCompetenceCollectiveResults', 'totalSkillsCount'),
  maxTotalSkillsCountInCompetences: computed.max('totalSkillsCounts'),

  averageValidatedSkills: computed('campaignCompetenceCollectiveResults', function() {

    const campaignCompetenceCollectiveResults =  this.campaignCompetenceCollectiveResults;
    return  _.sumBy(campaignCompetenceCollectiveResults.toArray(), 'roundedAverageValidatedSkills');
  }),

  totalSkills: computed.sum('totalSkillsCounts'),

  averageResult: computed('averageValidatedSkills', 'totalSkills', function() {
    return Math.round(this.averageValidatedSkills * 100 / this.totalSkills);
  }),
});
