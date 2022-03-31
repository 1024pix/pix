const querystring = require('querystring');
const get = require('lodash/get');

const settings = require('../../config');
const httpAgent = require('../../infrastructure/http/http-agent');

const { GeneratePoleEmploiTokensError } = require('../errors');

const PoleEmploiTokens = require('../models/PoleEmploiTokens');

const encryptionService = require('./encryption-service');
const tokenService = require('./token-service');

async function getUserByUsernameAndPassword({ username, password, userRepository }) {
  const foundUser = await userRepository.getByUsernameOrEmailWithRolesAndPassword(username);
  const passwordHash = foundUser.authenticationMethods[0].authenticationComplement.password;

  await encryptionService.checkPassword({
    password,
    passwordHash,
  });

  return foundUser;
}

async function exchangePoleEmploiCodeForTokens({ code, clientId, redirectUri }) {
  const data = {
    client_secret: settings.poleEmploi.clientSecret,
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
  };

  const tokensResponse = await httpAgent.post({
    url: settings.poleEmploi.tokenUrl,
    payload: querystring.stringify(data),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  });

  if (!tokensResponse.isSuccessful) {
    const errorMessage = _getErrorMessage(tokensResponse.data);
    throw new GeneratePoleEmploiTokensError(errorMessage, tokensResponse.code);
  }

  return new PoleEmploiTokens({
    accessToken: tokensResponse.data['access_token'],
    idToken: tokensResponse.data['id_token'],
    expiresIn: tokensResponse.data['expires_in'],
    refreshToken: tokensResponse.data['refresh_token'],
  });
}

async function getPoleEmploiUserInfo(idToken) {
  const { given_name, family_name, nonce, idIdentiteExterne } = await tokenService.extractPayloadFromPoleEmploiIdToken(
    idToken
  );

  return {
    firstName: given_name,
    lastName: family_name,
    externalIdentityId: idIdentiteExterne,
    nonce,
  };
}

function _getErrorMessage(data) {
  let message;

  if (data instanceof String) {
    message = data;
  } else {
    const error = get(data, 'error', '');
    const error_description = get(data, 'error_description', '');
    message = `${error} ${error_description}`;
  }
  return message.trim();
}

module.exports = {
  exchangePoleEmploiCodeForTokens,
  getPoleEmploiUserInfo,
  getUserByUsernameAndPassword,
};
