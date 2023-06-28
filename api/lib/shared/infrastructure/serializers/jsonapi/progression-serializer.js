import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (progression) {
  return new Serializer('progression', {
    attributes: ['completionRate'],
  }).serialize(progression);
};

export { serialize };
