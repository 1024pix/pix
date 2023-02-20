import { Deserializer } from 'jsonapi-serializer';

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
});

export default deserializer;
