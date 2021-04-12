const { Serializer } = require('jsonapi-serializer');
const UserDetailsForAdmin = require('../../../domain/models/UserDetailsForAdmin');

module.exports = {

  serialize(usersDetailsForAdmin) {
    return new Serializer('user', {
      attributes: [
        'firstName', 'lastName', 'email', 'username', 'cgu',
        'pixOrgaTermsOfServiceAccepted', 'pixCertifTermsOfServiceAccepted',
        'schoolingRegistrations', 'authenticationMethods',
      ],
      schoolingRegistrations: {
        ref: 'id',
        includes: true,
        attributes: ['firstName', 'lastName', 'birthdate', 'division', 'organizationId', 'organizationExternalId',
          'organizationName', 'createdAt', 'updatedAt'],
      },
      authenticationMethods: {
        ref: 'id',
        includes: true,
        attributes: ['identityProvider'],
      },
    }).serialize(usersDetailsForAdmin);
  },
  deserialize(json) {
    return new UserDetailsForAdmin({
      id: json.data.id,
      firstName: json.data.attributes['first-name'],
      lastName: json.data.attributes['last-name'],
      email: json.data.attributes.email,
      username: json.data.attributes.username,
    });
  },
};
