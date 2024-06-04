import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (invitation) {
  return new Serializer('sco-organization-invitation', {
    attributes: ['uai', 'lastName', 'firstName'],
  }).serialize(invitation);
};

const serializer = { serialize };
export { serialize, serializer };
