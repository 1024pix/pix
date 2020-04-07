import classic from 'ember-classic-decorator';
import Transform from '@ember-data/serializer/transform';

@classic
export default class Array extends Transform {
  deserialize(serialized) {
    return serialized;
  }

  serialize(deserialized) {
    return deserialized;
  }
}
