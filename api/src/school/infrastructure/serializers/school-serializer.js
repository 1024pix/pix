import { Serializer } from '../../../shared/infrastructure/serializers/jsonapi/base-serializer.js';

const serialize = function (school) {
  return new Serializer('school', {
    //keyForAttribute: 'kebab-case',
    attributes: ['code', 'name', 'organizationLearners'],
  }).serialize(school);
};

export const schoolSerializer = { serialize };
