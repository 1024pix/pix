import { Deserializer } from 'jsonapi-serializer';

const deserialize = function (payload) {
  return new Deserializer().deserialize(payload).then((record) => {
    return {
      newEmail: record['new-email'].trim()?.toLowerCase(),
      password: record['password'],
    };
  });
};

export { deserialize };
