import { Serializer } from '../../../shared/infrastructure/serializers/jsonapi/base-serializer.js';

const serialize = function (organizationLearner) {
  return new Serializer('organizationLearner', {
    pluralizeType: false,
    attributes: [
      'firstName',
      'displayName',
      'division',
      'organizationId',
      'completedMissionIds',
      'startedMissionIds',
      'features',
    ],
    transform: function (organizationLearner) {
      return {
        ...organizationLearner,
        completedMissionIds: organizationLearner.completedMissionIds?.map((id) => id.toString()),
        startedMissionIds: organizationLearner.startedMissionIds?.map((id) => id.toString()),
      };
    },
  }).serialize(organizationLearner);
};

export const organizationLearnerSerializer = { serialize };
