import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class CampaignAssessmentParticipationCompetenceResult extends Model {
  @attr('string') name;
  @attr('string') index;
  @attr('string') areaColor;
  @attr('number') competenceMasteryRate;

  @belongsTo('campaign-assessment-participation-result', { async: true, inverse: 'competenceResults' })
  campaignAssessmentParticipationResult;
}
