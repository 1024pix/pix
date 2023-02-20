import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(usersAnonymizedDetailsForAdmin) {
    return new Serializer('user-login', {
      attributes: ['userId', 'failureCount', 'temporaryBlockedUntil', 'blockedAt'],
    }).serialize(usersAnonymizedDetailsForAdmin);
  },
};
