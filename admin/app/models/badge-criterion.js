import Model, { attr, belongsTo } from '@ember-data/model';

export default class BadgeCriterion extends Model {
  @attr('string') scope;
  @attr('number') threshold;
  @attr() cappedTubes;
  @attr() name;

  @belongsTo('badge') badge;

  get isCampaignScope() {
    return this.scope === 'CampaignParticipation';
  }

  get isCappedTubesScope() {
    return this.scope === 'CappedTubes';
  }
}
