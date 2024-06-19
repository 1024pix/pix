import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class CampaignTubeRecommendation extends Model {
  @attr() areaColor;
  @attr() competenceName;
  @attr() competenceId;
  @attr() tubeId;
  @attr() tubePracticalTitle;
  @attr() tubeDescription;
  @attr() averageScore;

  @belongsTo('campaign-analysis', { async: true, inverse: 'campaignTubeRecommendations' }) campaignAnalysis;

  @hasMany('tutorial', { async: true, inverse: null }) tutorials;
}
