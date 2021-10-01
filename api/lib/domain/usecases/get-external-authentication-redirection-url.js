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
    const token = tokenService.createAccessTokenFromExternalUser(user.id);
    await userRepository.updateLastLoggedAt({ userId: user.id });
    return `/?token=${encodeURIComponent(token)}&user-id=${user.id}`;
  } else {
    const externalUserToken = tokenService.createIdTokenForUserReconciliation(externalUser);

    return `/campagnes?externalUser=${encodeURIComponent(externalUserToken)}`;
  }

};
