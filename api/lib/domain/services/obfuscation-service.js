import _ from 'lodash';
import authenticationMethodRepository from '../../infrastructure/repositories/authentication-method-repository';
import AuthenticationMethod from '../models/AuthenticationMethod';
import { NotFoundError } from '../errors';

const CONNEXION_TYPES = {
  username: 'username',
  email: 'email',
  samlId: 'samlId',
};
const ASTERISK_OBFUSCATION = '***';
const USERNAME_SEPARATOR = '.';
const EMAIL_SEPARATOR = '@';

const TWO_PARTS = 2;

async function getUserAuthenticationMethodWithObfuscation(user) {
  const garAuthenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId: user.id,
    identityProvider: AuthenticationMethod.identityProviders.GAR,
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
    name
  )}${ASTERISK_OBFUSCATION}${_.last(name)}`;
}

export default {
  usernameObfuscation,
  emailObfuscation,
  getUserAuthenticationMethodWithObfuscation,
};
