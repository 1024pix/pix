const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(usersAnonymizedDetailsForAdmin) {
    return new Serializer('user-login', {
      attributes: ['userId', 'failureCount', 'temporaryBlockedUntil', 'blockedAt'],
    }).serialize(usersAnonymizedDetailsForAdmin);
  },
};
