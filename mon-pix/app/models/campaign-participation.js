import Model, { belongsTo, attr } from '@ember-data/model';

export default class CampaignParticipation extends Model {

  // attributes
  @attr('boolean') isShared;
  @attr('date') createdAt;

  // includes
  @belongsTo('assessment') assessment;
  @belongsTo('campaign') campaign;
  @belongsTo('campaignParticipationResult') campaignParticipationResult;
  @belongsTo('user') user;

  // references
  @attr('string') participantExternalId;
}
