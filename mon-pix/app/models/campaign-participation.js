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
  @belongsTo('assessment', { async: true, inverse: null }) assessment;
  @belongsTo('campaign', { async: true, inverse: null }) campaign;
  @belongsTo('campaignParticipationResult', { async: true, inverse: null }) campaignParticipationResult;
  @belongsTo('user', { async: true, inverse: null }) user;

  @hasMany('training', { async: true, inverse: 'campaignParticipation' }) trainings;
}
