import Model, { attr, belongsTo } from '@ember-data/model';

export default class CampaignParticipation extends Model {
  @attr('boolean')
  isShared;

  @attr('string')
  participantExternalId;

  @attr('date')
  createdAt;

  @attr('date')
  sharedAt;

  @belongsTo('campaign')
  campaign;

  @belongsTo('user')
  user;

  @belongsTo('campaignAnalysis')
  campaignAnalysis;

  @belongsTo('campaignCollectiveResult')
  campaignCollectiveResult;
}
