import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(organizations, meta) {
    return new Serializer('sup-organization-learner-warnings', {
      attributes: ['warnings'],
      meta,
    }).serialize(organizations);
  },
};
