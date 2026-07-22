import { Serializer } from 'jsonapi-serializer';

const serialize = function (assessment) {
  return new Serializer('assessment', {
    pluralizeType: false,
    attributes: ['missionId', 'organizationLearnerId', 'state', 'result'],
  }).serialize(assessment);
};

export const assessmentSerializer = { serialize };
