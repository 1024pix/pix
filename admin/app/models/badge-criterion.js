import Model, { attr } from '@ember-data/model';

export default class BadgeCriterion extends Model {
  @attr('string') scope;
  @attr('number') threshold;
  @attr() cappedTubes;
  @attr() name;

  get isCampaignScope() {
    return this.scope === 'CampaignParticipation';
  }

  get isCappedTubesScope() {
    return this.scope === 'CappedTubes';
  }
}
