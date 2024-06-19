import Model, { attr, belongsTo } from '@ember-data/model';

export default class CampaignParticipation extends Model {
  @attr('boolean') isShared;
  @attr('string') participantExternalId;
  @attr('date') createdAt;
  @attr('date') sharedAt;

  @belongsTo('campaign', { async: true, inverse: null }) campaign;
  @belongsTo('user', { async: true, inverse: null }) user;
  @belongsTo('campaign-analysis', { async: true, inverse: null }) campaignAnalysis;
  @belongsTo('campaign-collective-result', { async: true, inverse: null }) campaignCollectiveResult;
}
