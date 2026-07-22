import { Serializer } from '../../../shared/infrastructure/serializers/jsonapi/base-serializer.js';

const serialize = function (assessment) {
  return new Serializer('assessment', {
    pluralizeType: false,
    attributes: ['missionId', 'organizationLearnerId', 'state', 'result'],
  }).serialize(assessment);
};

export const assessmentSerializer = { serialize };
