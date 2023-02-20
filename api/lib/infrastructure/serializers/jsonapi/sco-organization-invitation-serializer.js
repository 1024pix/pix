import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(invitation) {
    return new Serializer('sco-organization-invitation', {
      attributes: ['uai', 'lastName', 'firstName'],
    }).serialize(invitation);
  },
};
