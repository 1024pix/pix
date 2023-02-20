import { Deserializer } from 'jsonapi-serializer';

export default {
  deserialize(payload) {
    return new Deserializer().deserialize(payload).then((record) => {
      return {
        newEmail: record['new-email'].trim()?.toLowerCase(),
        password: record['password'],
      };
    });
  },
};
