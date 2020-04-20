const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(usersDetailsForAdmin) {
    return new Serializer('user', {
      attributes: [
        'firstName', 'lastName', 'email', 'username', 'cgu','isAuthenticatedFromGAR','pixOrgaTermsOfServiceAccepted',
        'pixCertifTermsOfServiceAccepted'
      ],
    }).serialize(usersDetailsForAdmin);
  },
};
