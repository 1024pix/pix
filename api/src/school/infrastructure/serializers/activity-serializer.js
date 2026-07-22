import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (activity) {
  return new Serializer('activity', {
    pluralizeType: false,
    attributes: ['level', 'assessmentId'],
  }).serialize(activity);
};

export const activitySerializer = { serialize };
