import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(features) {
    return new Serializer('feature-toggles', {
      transform(features) {
        return { id: 0, ...features };
      },
      attributes: Object.keys(features),
    }).serialize(features);
  },
};
