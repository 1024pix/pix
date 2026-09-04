import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

function serialize(divisions) {
  return new Serializer('divisions', {
    id: 'name',
    attributes: ['name'],
  }).serialize(divisions);
}

export const divisionSerializer = { serialize };
