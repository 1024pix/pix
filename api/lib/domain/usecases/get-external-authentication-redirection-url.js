module.exports = async function getExternalAuthenticationRedirectionUrl({
  userAttributes,
  userRepository,
  tokenService,
  settings,
}) {
  const { attributeMapping } = settings.saml;
  const externalUser = {
    firstName: userAttributes[attributeMapping.firstName],
    lastName: userAttributes[attributeMapping.lastName],
    samlId: userAttributes[attributeMapping.samlId],
  };

  const user = await userRepository.getBySamlId(externalUser.samlId);
  if (user) {
    return await _getUrlWithAccessToken({ user, tokenService, userRepository });
  }

  return _getUrlForReconciliationPage({ tokenService, externalUser });
};

async function _getUrlWithAccessToken({ user, tokenService, userRepository }) {
  const token = tokenService.createAccessTokenForSaml(user.id);
  await userRepository.updateLastLoggedAt({ userId: user.id });
  return `/?token=${encodeURIComponent(token)}&user-id=${user.id}`;
}

function _getUrlForReconciliationPage({ tokenService, externalUser }) {
  const externalUserToken = tokenService.createIdTokenForUserReconciliation(externalUser);
  return `/campagnes?externalUser=${encodeURIComponent(externalUserToken)}`;
}
