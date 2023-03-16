import jsonapiSerializer from 'jsonapi-serializer';

const { Deserializer } = jsonapiSerializer;

const deserialize = function (payload) {
  return new Deserializer().deserialize(payload).then((record) => {
    return {
      newEmail: record['new-email'].trim()?.toLowerCase(),
      password: record['password'],
    };
  });
};

export { deserialize };
