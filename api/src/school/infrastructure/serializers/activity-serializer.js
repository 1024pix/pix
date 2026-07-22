import { Serializer } from '../../../shared/infrastructure/serializers/jsonapi/base-serializer.js';

const serialize = function (activity) {
  return new Serializer('activity', {
    pluralizeType: false,
    attributes: ['level', 'assessmentId'],
  }).serialize(activity);
};

export const activitySerializer = { serialize };
