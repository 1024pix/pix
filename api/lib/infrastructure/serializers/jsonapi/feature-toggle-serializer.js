import { Serializer } from 'jsonapi-serializer';

const serialize = function (features) {
  return new Serializer('feature-toggles', {
    transform(features) {
      return { id: 0, ...features };
    },
    attributes: Object.keys(features),
  }).serialize(features);
};

export { serialize };
