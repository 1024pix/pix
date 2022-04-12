import { Serializer } from 'jsonapi-serializer';

const deserialize = function (payload) {
  return {
    color: payload.data.attributes.color,
  };
};
const serialize = function (userSettings = {}) {
  return new Serializer('user-setting', {
    attributes: ['color', 'createdAt', 'updatedAt', 'user-id'],
  }).serialize(userSettings);
};

export { deserialize, serialize };
