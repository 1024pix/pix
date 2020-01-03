const User = require('../models/User');

module.exports = async function getOrCreateSamlUser({
  userAttributes,
  userRepository,
  settings,
}) {
  const { attributeMapping } = settings.saml;

  function _getSamlId(userAttributes) {
    return userAttributes[attributeMapping.samlId];
  }

  function _getFirstName(userAttributes) {
    return userAttributes[attributeMapping.firstName];
  }

  function _getLastName(userAttributes) {
    return userAttributes[attributeMapping.lastName];
  }

  function _createDomainUser(userAttributes) {
    const user = new User({
      firstName: _getFirstName(userAttributes),
      lastName: _getLastName(userAttributes),
      samlId: _getSamlId(userAttributes),
      password: '',
      cgu: false
    });

    return user;
  }

  const foundUser = await userRepository.getBySamlId(_getSamlId(userAttributes));

  return foundUser || userRepository.create(_createDomainUser(userAttributes));
};

