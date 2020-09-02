import DS from 'ember-data';
const { Model, attr, hasMany, belongsTo } = DS;
import { computed } from '@ember/object';
import { mapBy, max } from '@ember/object/computed';

export default class CampaignAssessmentParticipationResult extends Model {
  @attr('number') campaignId;
  @belongsTo('campaignAssessmentParticipation') campaignAssessmentParticipation;
  @hasMany('campaignAssessmentParticipationCompetenceResult') competenceResults;

  @mapBy('competenceResults', 'totalSkillsCount') totalSkillsCountByCompetence;
  @max('totalSkillsCountByCompetence') maxTotalSkillsCount;

  @computed('competenceResults')
  get sortedCompetenceResults() {
    return this.competenceResults.sortBy('index');
  }
}
