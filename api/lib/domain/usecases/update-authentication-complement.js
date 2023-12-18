import { NotFoundError } from '../errors.js';

const updateAuthenticationComplement = async function ({
  authenticationMethodRepository,
  externalIdentifier,
  identityProvider,
  authenticationComplement,
}) {
  const authenticationMethod = await authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider({
    externalIdentifier,
    identityProvider,
  });

  if (!authenticationMethod) {
    throw new NotFoundError(
      `No authentication method found with externalIdentifier: ${externalIdentifier} and identityProvider: ${identityProvider}`,
    );
  }

  const id = authenticationMethod.id;
  await authenticationMethodRepository.update({ id, authenticationComplement });
};

export { updateAuthenticationComplement };
