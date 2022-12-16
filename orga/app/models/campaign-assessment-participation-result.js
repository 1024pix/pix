import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class CampaignAssessmentParticipationResult extends Model {
  @attr('number') campaignId;
  @belongsTo('campaignAssessmentParticipation') campaignAssessmentParticipation;
  @hasMany('campaignAssessmentParticipationCompetenceResult') competenceResults;

  get sortedCompetenceResults() {
    return this.competenceResults.sortBy('index');
  }
}
