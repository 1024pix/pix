import Model, { attr } from '@ember-data/model';

export default class CampaignProfileCompetence extends Model {
  @attr('string') name;

  @attr('string') index;

  @attr('number') pixScore;

  @attr('number') estimatedLevel;

  @attr('string') areaColor;
}
