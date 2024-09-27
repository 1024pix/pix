import { Serializer } from 'jsonapi-serializer';

const serialize = function ({ missionLearners, pagination }) {
  return new Serializer('mission-learner', {
    attributes: ['firstName', 'lastName', 'division', 'organizationId', 'missionStatus', 'result'],
    meta: pagination,
  }).serialize(missionLearners);
};

export { serialize };
