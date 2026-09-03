import type { ArrayValue } from '@warp-drive/core/types/json/raw';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { BooleanTransform } from '@warp-drive/legacy/serializer/transform';

import type ArrayTransform from '../transforms/array';

export default class FeatureToggle extends Model {
  declare [Type]: 'feature-toggle';

  @attr<ArrayTransform>('array') declare disabledLocalesInFrontend: ArrayValue | null;
  @attr<BooleanTransform>('boolean') declare displayCatalogue: boolean | null;
  @attr<BooleanTransform>('boolean') declare isSessionLogoutEnabled: boolean | null;
}
