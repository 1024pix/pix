import Model, { attr } from '@warp-drive/legacy/model';

export default class CampaignProfileCompetence extends Model {
  @attr('string') name;
  @attr('string') index;
  @attr('number') pixScore;
  @attr('number') estimatedLevel;
  @attr('string') areaColor;
}
