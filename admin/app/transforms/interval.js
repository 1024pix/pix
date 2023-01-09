import Transform from '@ember-data/serializer/transform';

export default class IntervalTransform extends Transform {
  serialize(deserialized) {
    if (!deserialized) return null;

    const days = deserialized?.days || 0;
    const hours = deserialized?.hours || 0;
    const minutes = deserialized?.minutes || 0;

    return `${days}d${hours}h${minutes}m`;
  }

  deserialize(serialized) {
    return serialized;
  }
}
