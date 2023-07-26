import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class CampaignParticipation extends Model {
  // attributes
  @attr('boolean') isShared;
  @attr('boolean') isReset;
  @attr('date') createdAt;
  @attr('date') sharedAt;
  @attr('date') deletedAt;

  // references
  @attr('string') participantExternalId;

  // includes
  @belongsTo('assessment') assessment;
  @belongsTo('campaign') campaign;
  @belongsTo('campaignParticipationResult') campaignParticipationResult;
  @belongsTo('user') user;

  @hasMany('training', { async: true, inverse: 'campaignParticipation' }) trainings;
}
