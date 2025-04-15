import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (targetProfiles, meta) {
  return new Serializer('target-profile', {
    attributes: ['name', 'isSimplifiedAccess'],
    meta,
  }).serialize(targetProfiles);
};

export { serialize };
