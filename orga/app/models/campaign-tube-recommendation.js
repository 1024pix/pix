import Model, { belongsTo, hasMany, attr } from '@ember-data/model';

export default class CampaignTubeRecommendation extends Model {
  @attr() areaColor;
  @attr() competenceName;
  @attr() competenceId;
  @attr() tubeId;
  @attr() tubePracticalTitle;
  @attr() tubeDescription;
  @attr() averageScore;

  @belongsTo('campaignAnalysis', { async: true, inverse: 'campaignTubeRecommendations' }) campaignAnalysis;

  @hasMany('tutorial', { async: true, inverse: null }) tutorials;
}
