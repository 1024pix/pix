import DS from 'ember-data';
const { belongsTo, Model, attr } = DS;

export default class CampaignTubeRecommendation extends Model {

  @attr() areaColor;
  @attr() competenceName;
  @attr() competenceId;
  @attr() tubeId;
  @attr() tubePracticalTitle;

  @belongsTo('campaignAnalysis') campaignAnalysis;

}
