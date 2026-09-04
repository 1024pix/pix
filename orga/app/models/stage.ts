import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class Stage extends Model {
  declare [Type]: 'stage';

  @attr<StringTransform>('string') declare prescriberTitle: string | null;
  @attr<StringTransform>('string') declare prescriberDescription: string | null;
  @attr<NumberTransform>('number') declare threshold: number | null;
}
