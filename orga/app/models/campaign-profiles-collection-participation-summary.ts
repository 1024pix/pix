import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type {
  BooleanTransform,
  DateTransform,
  NumberTransform,
  StringTransform,
} from '@warp-drive/legacy/serializer/transform';

import type NullableStringTransform from '../transforms/nullable-string';

export default class CampaignProfilesCollectionParticipationSummary extends Model {
  declare [Type]: 'campaign-profiles-collection-participation-summary';

  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<StringTransform>('string') declare lastName: string | null;
  @attr<StringTransform>('string') declare participantExternalId: string | null;
  @attr<DateTransform>('date') declare sharedAt: Date | null;
  @attr<NumberTransform>('number') declare pixScore: number | null;
  @attr<NumberTransform>('number') declare sharedProfileCount: number | null;
  @attr<NullableStringTransform>('nullable-string') declare evolution: 'increase' | 'decrease' | 'stable' | null;
  @attr<BooleanTransform>('boolean') declare certifiable: boolean | null;
  @attr<NumberTransform>('number') declare certifiableCompetencesCount: number | null;
}
