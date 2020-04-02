import DS from 'ember-data';
const { hasMany, Model } = DS;

export default class CampaignAnalysis extends Model {

  @hasMany('CampaignTubeRecommendation') campaignTubeRecommendations;

}
