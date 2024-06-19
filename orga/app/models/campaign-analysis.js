import Model, { hasMany } from '@ember-data/model';

export default class CampaignAnalysis extends Model {
  @hasMany('campaign-tube-recommendation', { async: true, inverse: 'campaignAnalysis' }) campaignTubeRecommendations;
}
