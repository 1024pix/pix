import _ from 'lodash';

import { NotFoundError } from '../../../shared/domain/errors.js';
import * as authenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import * as userRepository from '../../infrastructure/repositories/user.repository.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';

const CONNEXION_TYPES = { username: 'username', email: 'email', samlId: 'samlId' };
const ASTERISK_OBFUSCATION = '***';
const USERNAME_SEPARATOR = '.';
const EMAIL_SEPARATOR = '@';
const TWO_PARTS = 2;

export async function getObfuscatedAuthenticationMethod(
  userId,
  dependencies = { userRepository, authenticationMethodRepository },
) {
  const user = await dependencies.userRepository.get(userId);

  const garAuthenticationMethod = await dependencies.authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId: user.id,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
  });
  if (garAuthenticationMethod) return { authenticatedBy: CONNEXION_TYPES.samlId, value: null };

  if (user.username) {
    const username = usernameObfuscation(user.username);
    return { authenticatedBy: CONNEXION_TYPES.username, value: username };
  }

  if (user.email) {
    const email = emailObfuscation(user.email);
    return { authenticatedBy: CONNEXION_TYPES.email, value: email };
  } else {
    throw new NotFoundError("Aucune méthode d'authentification trouvée dont le fournisseur d'identité est GAR ou PIX.");
  }
}

function emailObfuscation(email) {
  const parts = _.split(email, EMAIL_SEPARATOR, TWO_PARTS);
  return `${_.first(email)}${ASTERISK_OBFUSCATION}${EMAIL_SEPARATOR}${_.last(parts)}`;
}

function usernameObfuscation(username) {
  const parts = _.split(username, USERNAME_SEPARATOR, TWO_PARTS);
  const name = _.last(parts);
  return `${_.first(username)}${ASTERISK_OBFUSCATION}${USERNAME_SEPARATOR}${_.first(
    name,
  )}${ASTERISK_OBFUSCATION}${_.last(name)}`;
}
