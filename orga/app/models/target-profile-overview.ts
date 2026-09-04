import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr, type HasMany, hasMany } from '@warp-drive/legacy/model';
import type { BooleanTransform, NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type Badge from './badge';
import type Framework from './framework';

export default class TargetProfileOverview extends Model {
  declare [Type]: 'target-profile-overview';

  @attr<StringTransform>('string') declare name: string | null;
  @attr<StringTransform>('string') declare description: string | null;
  @attr<BooleanTransform>('boolean') declare areKnowledgeElementsResettable: boolean | null;
  @attr<BooleanTransform>('boolean') declare isSimplifiedAccess: boolean | null;

  @attr<StringTransform>('string') declare imageUrl: string | null;
  @attr<StringTransform>('string') declare category: string | null;
  @attr<NumberTransform>('number') declare level: number | null;

  @hasMany<Framework>('framework', { async: false, inverse: null }) declare frameworks: HasMany<Framework>;
  @hasMany<Badge>('badge', { async: false, inverse: null }) declare badges: HasMany<Badge>;
}
