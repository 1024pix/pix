import Model, { attr, hasMany } from '@ember-data/model';

export default class CampaignAssessmentResultMinimal extends Model {
  @attr() firstName;
  @attr() lastName;
  @attr() participantExternalId;
  @attr() masteryPercentage;

  @hasMany('Badge') badges;
}
