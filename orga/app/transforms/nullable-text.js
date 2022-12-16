import Transform from '@ember-data/serializer/transform';

export default class NullableText extends Transform {
  serialize(string) {
    if (typeof string !== 'string') return null;

    return string.trim() ? string : null;
  }

  deserialize(string) {
    return string;
  }
}
