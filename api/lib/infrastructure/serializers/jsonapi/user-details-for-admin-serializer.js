const { Serializer } = require('jsonapi-serializer');
const UserDetailsForAdmin = require('../../../domain/models/UserDetailsForAdmin');

module.exports = {

  serialize(usersDetailsForAdmin) {
    return new Serializer('user', {
      attributes: [
        'firstName', 'lastName', 'email', 'username', 'cgu',
        'pixOrgaTermsOfServiceAccepted', 'pixCertifTermsOfServiceAccepted',
        'isAuthenticatedFromGAR', 'schoolingRegistrations',
      ],
      schoolingRegistrations: {
        ref: 'id',
        includes: true,
        attributes: ['firstName', 'lastName', 'birthdate', 'division', 'organizationId', 'organizationExternalId',
          'organizationName', 'createdAt', 'updatedAt'],
      },
    }).serialize(usersDetailsForAdmin);
  },
  deserialize(json) {
    return new UserDetailsForAdmin({
      id: json.data.id,
      firstName: json.data.attributes['first-name'],
      lastName: json.data.attributes['last-name'],
      email: json.data.attributes.email,
    });
  },
};
