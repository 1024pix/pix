import DS from 'ember-data';
const { Model, attr, hasMany, belongsTo } = DS;
import maxBy from 'lodash/maxBy';

export default class CampaignAssessmentParticipationResult extends Model {
  @attr('number') campaignId;
  @belongsTo('campaignAssessmentParticipation') campaignAssessmentParticipation;
  @hasMany('campaignAssessmentParticipationCompetenceResult') competenceResults;

  get maxTotalSkillsCount() {
    return maxBy(this.competenceResults.toArray(), 'targetedSkillsCount').targetedSkillsCount;
  }

  get sortedCompetenceResults() {
    return this.competenceResults.sortBy('index');
  }
}
