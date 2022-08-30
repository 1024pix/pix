import Transform from '@ember-data/serializer/transform';

export default class NullableBoolean extends Transform {
  serialize(boolean) {
    if (typeof boolean !== 'boolean') return null;
    return boolean;
  }

  deserialize(boolean) {
    return boolean;
  }
}
