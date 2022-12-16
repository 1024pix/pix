import Transform from '@ember-data/serializer/transform';

export default class NullableStringTransform extends Transform {
  serialize(string) {
    if (typeof string !== 'string') return null;

    const result = string.trim();

    return result || null;
  }

  deserialize(string) {
    return string;
  }
}
