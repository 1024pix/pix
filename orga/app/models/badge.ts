import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { BooleanTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class Badge extends Model {
  declare [Type]: 'badge';

  @attr<StringTransform>('string') declare title: string | null;
  @attr<StringTransform>('string') declare imageUrl: string | null;
  @attr<StringTransform>('string') declare altMessage: string | null;
  @attr<BooleanTransform>('boolean') declare acquired: boolean | null;
}
