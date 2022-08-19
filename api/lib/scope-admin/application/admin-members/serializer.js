const { Serializer } = require('jsonapi-serializer');

module.exports = {
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
};
