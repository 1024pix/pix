import { Serializer } from 'jsonapi-serializer';

const serialize = function (usersAnonymizedDetailsForAdmin) {
  return new Serializer('user', {
    attributes: [
      'firstName',
      'lastName',
      'email',
      'username',
      'cgu',
      'hasBeenAnonymised',
      'anonymisedByFullName',
      'updatedAt',
      'pixOrgaTermsOfServiceAccepted',
      'pixCertifTermsOfServiceAccepted',
      'authenticationMethods',
    ],
    authenticationMethods: {
      ref: 'id',
      includes: true,
      attributes: ['identityProvider'],
    },
  }).serialize(usersAnonymizedDetailsForAdmin);
};

export { serialize };
