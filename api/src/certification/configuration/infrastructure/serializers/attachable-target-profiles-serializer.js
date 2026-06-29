import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize(targetProfiles) {
  return new Serializer('attachable-target-profile', {
    attributes: ['name'],
  }).serialize(targetProfiles);
}
