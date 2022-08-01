import Transform from '@ember-data/serializer/transform';

export default class NullableTextTransform extends Transform {
  serialize(string) {
    if (typeof string !== 'string') return null;

    return string.trim() ? string : null;
  }

  deserialize(string) {
    return string;
  }
}
