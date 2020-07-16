const _ = require('lodash');

const CONNEXION_TYPES = {
  username: 'username',
  email: 'email',
  samlId: 'samlId',
};
const ASTERISK_OBFUSCATION = '***';
const USERNAME_SEPARATOR = '.';
const EMAIL_SEPARATOR = '@';

const TWO_PARTS = 2;

function getUserAuthenticationMethodWithObfuscation(user) {
  if (user.samlId) return { authenticatedBy: CONNEXION_TYPES.samlId, value: null };

  if (user.username) {
    const username = usernameObfuscation(user.username);
    return { authenticatedBy: CONNEXION_TYPES.username, value: username };
  }
  if (user.email) {
    const email = emailObfuscation(user.email);
    return { authenticatedBy: CONNEXION_TYPES.email, value: email };
  }
}

function emailObfuscation(email) {
  const parts = _.split(email, EMAIL_SEPARATOR, TWO_PARTS);
  return `${_.first(email)}${ASTERISK_OBFUSCATION}${EMAIL_SEPARATOR}${_.last(parts)}`;
}

function usernameObfuscation(username) {
  const parts = _.split(username, USERNAME_SEPARATOR, TWO_PARTS);
  const name = _.last(parts);
  return `${_.first(username)}${ASTERISK_OBFUSCATION}${USERNAME_SEPARATOR}${_.first(name)}${ASTERISK_OBFUSCATION}${_.last(name)}`;
}

module.exports = {
  usernameObfuscation,
  emailObfuscation,
  getUserAuthenticationMethodWithObfuscation
};
