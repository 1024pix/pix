import { Serializer } from 'jsonapi-serializer';

const serialize = function (progression) {
  return new Serializer('progression', {
    attributes: ['completionRate'],
  }).serialize(progression);
};

export { serialize };
