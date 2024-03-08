import { Serializer } from 'jsonapi-serializer';

const serialize = function (organizationLearner) {
  return new Serializer('organizationLearner', {
    attributes: ['firstName', 'displayName', 'division', 'organizationId', 'completedMissionIds'],
  }).serialize(organizationLearner);
};

export { serialize };
