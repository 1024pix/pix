import jsonapiSerializer from 'jsonapi-serializer';
const { Deserializer } = jsonapiSerializer;

const deserialize = async function (payload) {
  const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
  return await deserializer.deserialize(payload);
};

export { deserialize };
