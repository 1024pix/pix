import { Transform } from '@warp-drive/legacy/serializer/transform';

export default class Array extends Transform {
  deserialize(serialized) {
    return serialized;
  }

  serialize(deserialized) {
    return deserialized;
  }
}
