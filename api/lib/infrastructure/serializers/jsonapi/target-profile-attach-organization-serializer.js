import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(model) {
    return new Serializer('target-profile-attach-organization', {
      id: 'targetProfileId',
      attributes: ['duplicatedIds', 'attachedIds'],
    }).serialize(model);
  },
};
