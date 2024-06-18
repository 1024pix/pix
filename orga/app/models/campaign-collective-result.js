import Model, { hasMany } from '@ember-data/model';

export default class CampaignCollectiveResult extends Model {
  @hasMany('campaign-competence-collective-result', { async: true, inverse: 'campaignCollectiveResult' })
  campaignCompetenceCollectiveResults;
}
