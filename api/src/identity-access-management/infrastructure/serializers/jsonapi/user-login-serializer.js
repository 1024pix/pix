import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (usersAnonymizedDetailsForAdmin) {
  return new Serializer('user-login', {
    attributes: ['userId', 'failureCount', 'temporaryBlockedUntil', 'blockedAt'],
  }).serialize(usersAnonymizedDetailsForAdmin);
};

export { serialize };
