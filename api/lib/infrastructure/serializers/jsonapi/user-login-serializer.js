import { Serializer } from 'jsonapi-serializer';

const serialize = function (usersAnonymizedDetailsForAdmin) {
  return new Serializer('user-login', {
    attributes: ['userId', 'failureCount', 'temporaryBlockedUntil', 'blockedAt'],
  }).serialize(usersAnonymizedDetailsForAdmin);
};

export { serialize };
