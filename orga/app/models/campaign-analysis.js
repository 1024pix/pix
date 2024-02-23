import Model, { hasMany } from '@ember-data/model';

export default class CampaignAnalysis extends Model {
  @hasMany('CampaignTubeRecommendation', { async: true, inverse: 'campaignAnalysis' }) campaignTubeRecommendations;
}
