import { TransformName } from '@warp-drive/core/types/symbols';
import { Transform } from '@warp-drive/legacy/serializer/transform';

export default class NullableStringTransform extends Transform {
  declare [TransformName]: 'nullable-string';

  serialize(string: unknown): string | null {
    if (typeof string !== 'string') return null;

    const result = string.trim();

    return result || null;
  }

  deserialize(string: string | null): string | null {
    return string;
  }
}
