import Model, { attr, belongsTo, hasMany } from '@warp-drive/legacy/model';

export default class CampaignAssessmentParticipation extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('number') organizationLearnerId;
  @attr('number') campaignId;
  @attr('string') participantExternalId;
  @attr('date') createdAt;
  @attr('date') sharedAt;
  @attr('boolean') isShared;
  @attr('number') targetedSkillsCount;
  @attr('number') validatedSkillsCount;
  @attr('number') masteryRate;
  @attr('number') reachedStage;
  @attr('number') totalStage;
  @attr('string') prescriberTitle;
  @attr('string') prescriberDescription;
  @attr('number') progression;

  @belongsTo('campaign-assessment-participation-result', { async: true, inverse: 'campaignAssessmentParticipation' })
  campaignAssessmentParticipationResult;
  @belongsTo('campaign-participation-levels-per-tubes-and-competence', { async: true, inverse: null })
  campaignParticipationLevelsPerTubesAndCompetence;

  @hasMany('badge', { async: true, inverse: null }) badges;
}
