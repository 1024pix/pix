import Model, { hasMany } from '@ember-data/model';

export default class CampaignCollectiveResult extends Model {
  @hasMany('campaignCompetenceCollectiveResult', { async: true, inverse: 'campaignCollectiveResult' })
  campaignCompetenceCollectiveResults;
}
