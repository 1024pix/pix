import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (organizations, meta) {
  return new Serializer('sup-organization-learner-warnings', {
    attributes: ['warnings'],
    meta,
  }).serialize(organizations);
};

export { serialize };
