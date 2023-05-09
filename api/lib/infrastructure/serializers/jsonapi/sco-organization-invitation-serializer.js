import { Serializer } from 'jsonapi-serializer';

const serialize = function (invitation) {
  return new Serializer('sco-organization-invitation', {
    attributes: ['uai', 'lastName', 'firstName'],
  }).serialize(invitation);
};

export { serialize };
