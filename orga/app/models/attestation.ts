import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { StringTransform } from '@warp-drive/legacy/serializer/transform';

export default class Attestations extends Model {
  declare [Type]: 'attestation';

  @attr<StringTransform>('string') declare label: string | null;
  @attr<StringTransform>('string') declare key: string | null;
}
