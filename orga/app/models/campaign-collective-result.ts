import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncHasMany, hasMany } from '@warp-drive/legacy/model';

import type CampaignCompetenceCollectiveResult from './campaign-competence-collective-result';

export default class CampaignCollectiveResult extends Model {
  declare [Type]: 'campaign-collective-result';

  @hasMany<CampaignCompetenceCollectiveResult>('campaign-competence-collective-result', {
    async: true,
    inverse: 'campaignCollectiveResult',
  })
  declare campaignCompetenceCollectiveResults: AsyncHasMany<CampaignCompetenceCollectiveResult>;
}
