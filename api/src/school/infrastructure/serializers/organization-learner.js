import { Serializer } from 'jsonapi-serializer';

const serialize = function (organizationLearner) {
  return new Serializer('organizationLearner', {
    attributes: ['firstName', 'displayName', 'division', 'organizationId', 'completedMissionIds', 'startedMissionIds'],
    transform: function (organizationLearner) {
      return {
        ...organizationLearner,
        completedMissionIds: organizationLearner.completedMissionIds?.map((id) => id.toString()),
        startedMissionIds: organizationLearner.startedMissionIds?.map((id) => id.toString()),
      };
    },
  }).serialize(organizationLearner);
};

export { serialize };
