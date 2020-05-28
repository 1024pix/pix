const { Serializer } = require('jsonapi-serializer');
const UserDetailsForAdmin = require('../../../domain/models/UserDetailsForAdmin');

module.exports = {

  serialize(usersDetailsForAdmin) {
    return new Serializer('user', {
      attributes: [
        'firstName', 'lastName', 'email', 'username', 'cgu','isAuthenticatedFromGAR','pixOrgaTermsOfServiceAccepted',
        'pixCertifTermsOfServiceAccepted'
      ],
    }).serialize(usersDetailsForAdmin);
  },
  deserialize(json) {
    return new UserDetailsForAdmin({
      id: json.data.id,
      firstName: json.data.attributes['first-name'],
      lastName: json.data.attributes['last-name'],
      email: json.data.attributes.email
    });
  }
};
