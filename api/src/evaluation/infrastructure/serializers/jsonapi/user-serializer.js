import { Serializer } from 'jsonapi-serializer';

const serialize = function (users) {
  return new Serializer('user', {
    attributes: ['hasSeenAssessmentInstructions', 'hasSeenNewDashboardInfo'],
  }).serialize(users);
};

export const userSerializer = { serialize };
