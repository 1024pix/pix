import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default class CampaignAssessmentParticipation extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('number') campaignId;
  @attr('string') participantExternalId;
  @attr('date') createdAt;
  @attr('date') sharedAt;
  @attr('boolean') isShared;
  @attr('number') totalSkillsCount;
  @attr('number') validatedSkillsCount;
  @attr('number') masteryPercentage;
  @attr('number') progression;
  @belongsTo('campaignAnalysis') campaignAnalysis;
  @belongsTo('campaignAssessmentParticipationResult') campaignAssessmentParticipationResult;
}
