import Model, { belongsTo, hasMany, attr } from '@ember-data/model';

export default class CampaignTubeRecommendation extends Model {

  @attr() areaColor;
  @attr() competenceName;
  @attr() competenceId;
  @attr() tubeId;
  @attr() tubePracticalTitle;
  @attr() averageScore;

  @belongsTo('campaignAnalysis') campaignAnalysis;

  @hasMany('tutorial') tutorials;
}
