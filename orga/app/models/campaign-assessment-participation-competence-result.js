import Model, { attr, belongsTo } from '@ember-data/model';

export default class CampaignAssessmentParticipationCompetenceResult extends Model {
  @attr('string') name;
  @attr('string') index;
  @attr('string') areaColor;
  @attr('number') competenceMasteryRate;
  @belongsTo('campaignAssessmentParticipationResult') campaignAssessmentParticipationResult;
}
