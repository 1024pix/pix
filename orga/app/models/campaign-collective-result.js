import Model, { hasMany } from '@warp-drive/legacy/model';

export default class CampaignCollectiveResult extends Model {
  @hasMany('campaign-competence-collective-result', { async: true, inverse: 'campaignCollectiveResult' })
  campaignCompetenceCollectiveResults;
}
