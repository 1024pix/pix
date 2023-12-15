import Model, { attr, belongsTo } from '@ember-data/model';

export default class ReachedStage extends Model {
  @attr('string') title;
  @attr('string') message;
  @attr('number') totalStage;
  @attr('number') reachedStage;
  @attr('number') threshold;

  @belongsTo('campaign-participation-result', { async: true, inverse: 'reachedStage' }) campaignParticipationResult;
}
