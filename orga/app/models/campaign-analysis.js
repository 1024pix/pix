import { sort } from '@ember/object/computed';
import DS from 'ember-data';
const { hasMany, Model } = DS;

export default class CampaignAnalysis extends Model {

  @hasMany('CampaignTubeRecommendation') campaignTubeRecommendations;

  @sort('campaignTubeRecommendations', (a, b) => (a.averageScore - b.averageScore))
  sortedCampaignTubeRecommendations;

}
