import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class Division extends Model {
  declare [Type]: 'division';

  @attr<StringTransform>('string') declare name: string | null;
}
