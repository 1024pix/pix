import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (activity) {
  return new Serializer('activity', {
    attributes: ['level', 'assessmentId'],
  }).serialize(activity);
};

export { serialize };
