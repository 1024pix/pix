import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, attr, belongsTo } from '@warp-drive/legacy/model';
import type { BooleanTransform, DateTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type Campaign from './campaign';
import type CampaignCollectiveResult from './campaign-collective-result';
import type User from './user';

export default class CampaignParticipation extends Model {
  declare [Type]: 'campaign-participation';

  @attr<BooleanTransform>('boolean') declare isShared: boolean | null;
  @attr<StringTransform>('string') declare participantExternalId: string | null;
  @attr<DateTransform>('date') declare createdAt: Date | null;
  @attr<DateTransform>('date') declare sharedAt: Date | null;

  @belongsTo<Campaign>('campaign', { async: true, inverse: null }) declare campaign: AsyncBelongsTo<Campaign>;
  @belongsTo('user', { async: true, inverse: null }) declare user: AsyncBelongsTo<User>;
  @belongsTo<CampaignCollectiveResult>('campaign-collective-result', { async: true, inverse: null })
  declare campaignCollectiveResult: AsyncBelongsTo<CampaignCollectiveResult>;
}
