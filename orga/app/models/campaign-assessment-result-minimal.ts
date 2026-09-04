import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncHasMany, attr, hasMany } from '@warp-drive/legacy/model';
import type { NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type Badge from './badge';

export default class CampaignAssessmentResultMinimal extends Model {
  declare [Type]: 'campaign-assessment-result-minimal';

  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<StringTransform>('string') declare lastName: string | null;
  @attr<StringTransform>('string') declare participantExternalId: string | null;
  @attr<NumberTransform>('number') declare masteryRate: number | null;
  @attr() declare evolution: 'increase' | 'decrease' | 'stable' | null;
  @attr<NumberTransform>('number') declare reachedStage: number | null;
  @attr<NumberTransform>('number') declare totalStage: number | null;
  @attr<StringTransform>('string') declare prescriberTitle: string | null;
  @attr<StringTransform>('string') declare prescriberDescription: string | null;
  @attr<NumberTransform>('number') declare sharedResultCount: number | null;

  @hasMany('badge', { async: true, inverse: null }) declare badges: AsyncHasMany<Badge>;
}
