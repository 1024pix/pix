import { Serializer } from 'jsonapi-serializer';

const serialize = function (organizations, meta) {
  return new Serializer('sup-organization-learner-warnings', {
    attributes: ['warnings'],
    meta,
  }).serialize(organizations);
};

export { serialize };
