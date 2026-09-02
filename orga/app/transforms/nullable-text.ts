import { TransformName } from '@warp-drive/core/types/symbols';
import { Transform } from '@warp-drive/legacy/serializer/transform';

export default class NullableTextTransform extends Transform {
  declare [TransformName]: 'nullable-text';

  serialize(string: unknown): string | null {
    if (typeof string !== 'string') return null;

    return string.trim() ? string : null;
  }

  deserialize(string: string | null): string | null {
    return string;
  }
}
