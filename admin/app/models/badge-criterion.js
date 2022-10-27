import Model, { attr } from '@ember-data/model';

export default class BadgeCriterion extends Model {
  @attr('string') scope;
  @attr('number') threshold;
  @attr() skillSets;
  @attr() cappedTubes;

  get isCampaignScope() {
    return this.scope === 'CampaignParticipation';
  }

  get isSkillSetScope() {
    return this.scope === 'SkillSet';
  }
}
