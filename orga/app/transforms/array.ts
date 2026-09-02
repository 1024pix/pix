import type { ArrayValue } from '@warp-drive/core/types/json/raw';
import { TransformName } from '@warp-drive/core/types/symbols';
import { Transform } from '@warp-drive/legacy/serializer/transform';

export default class ArrayTransform extends Transform {
  declare [TransformName]: 'array';

  deserialize(serialized: ArrayValue | null): ArrayValue | null {
    return serialized;
  }

  serialize(deserialized: ArrayValue | null): ArrayValue | null {
    return deserialized;
  }
}
