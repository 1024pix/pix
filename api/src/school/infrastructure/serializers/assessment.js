import { Serializer } from 'jsonapi-serializer';

const serialize = function (assessment) {
  return new Serializer('assessment', {
    attributes: ['missionId', 'organizationLearnerId', 'state'],
  }).serialize(assessment);
};

export { serialize };
