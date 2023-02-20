import { Serializer, Deserializer } from 'jsonapi-serializer';

export default {
  serialize(adminMembers, meta) {
    return new Serializer('admin-member', {
      attributes: [
        'firstName',
        'lastName',
        'email',
        'role',
        'userId',
        'isSuperAdmin',
        'isCertif',
        'isMetier',
        'isSupport',
      ],
      meta,
    }).serialize(adminMembers);
  },

  async deserialize(jsonApiData) {
    const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
    return await deserializer.deserialize(jsonApiData);
  },
};
