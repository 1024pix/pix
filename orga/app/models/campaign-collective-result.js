import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  campaignCompetenceCollectiveResults: DS.hasMany('campaignCompetenceCollectiveResult'),

  totalSkillsCounts: computed.mapBy('campaignCompetenceCollectiveResults', 'totalSkillsCount'),
  maxTotalSkillsCountInCompetences: computed.max('totalSkillsCounts'),
});
