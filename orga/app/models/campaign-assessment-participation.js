import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class CampaignAssessmentParticipation extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('number') campaignId;
  @attr('string') participantExternalId;
  @attr('date') createdAt;
  @attr('date') sharedAt;
  @attr('boolean') isShared;
  @attr('number') targetedSkillsCount;
  @attr('number') validatedSkillsCount;
  @attr('number') masteryRate;
  @attr('number') progression;
  @belongsTo('campaignAnalysis') campaignAnalysis;
  @belongsTo('campaignAssessmentParticipationResult') campaignAssessmentParticipationResult;
  @hasMany('badge') badges;
}
