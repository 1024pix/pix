import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (targetProfiles) {
  return new Serializer('attachable-target-profile', {
    attributes: ['name'],
  }).serialize(targetProfiles);
};

export { serialize };
