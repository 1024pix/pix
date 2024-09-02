import { Serializer } from 'jsonapi-serializer';

const serialize = function (assessment) {
  return new Serializer('assessment', {
    attributes: ['missionId', 'organizationLearnerId', 'state', 'result'],
  }).serialize(assessment);
};

export { serialize };
