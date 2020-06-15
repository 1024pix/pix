import DS from 'ember-data';
const { Model, attr } = DS;

export default class CampaignProfileCompetence extends Model {
  @attr('string') name;

  @attr('string') index;

  @attr('number') pixScore;

  @attr('number') estimatedLevel;

  @attr('string') areaColor;
}
