import { Transform } from '@warp-drive/legacy/serializer/transform';

export default class NullableString extends Transform {
  serialize(string) {
    if (typeof string !== 'string') return null;

    const result = string.trim();

    return result || null;
  }

  deserialize(string) {
    return string;
  }
}
