import Model, { attr, hasMany } from '@ember-data/model';

export default class CampaignAssessmentResultMinimal extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') participantExternalId;
  @attr('number') masteryRate;
  @attr('number') reachedStage;
  @attr('number') totalStage;
  @attr('string') prescriberTitle;
  @attr('string') prescriberDescription;

  @hasMany('Badge') badges;
}
