import DS from 'ember-data';
const { belongsTo, hasMany, Model, attr } = DS;

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
