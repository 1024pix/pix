const jsonwebtoken = require('jsonwebtoken');
const get = require('lodash/get');
const settings = require('../../config');
const { v4: uuidv4 } = require('uuid');
const httpAgent = require('../../infrastructure/http/http-agent');
const querystring = require('querystring');
const { GenerateCnavTokensError } = require('../errors');

async function exchangeCodeForTokens({ code, redirectUri }) {
  const data = {
    client_secret: settings.cnav.clientSecret,
    grant_type: 'authorization_code',
    code,
    client_id: settings.cnav.clientId,
    redirect_uri: redirectUri,
  };

  const tokensResponse = await httpAgent.post({
    url: settings.cnav.tokenUrl,
    payload: querystring.stringify(data),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  });

  if (!tokensResponse.isSuccessful) {
    const errorMessage = _getErrorMessage(tokensResponse.data);
    // à mutualiser avec Pole Emploi ?
    throw new GenerateCnavTokensError(errorMessage, tokensResponse.code);
  }

  return tokensResponse.data['id_token'];
}

async function getUserInfo(idToken) {
  const { given_name, family_name, nonce, sub } = await _extractClaimsFromIdToken(idToken);

  return {
    firstName: given_name,
    lastName: family_name,
    externalIdentityId: sub,
    nonce,
  };
}

function getAuthUrl({ redirectUri }) {
  const redirectTarget = new URL(settings.cnav.authUrl);
  const state = uuidv4();
  const nonce = uuidv4();
  const clientId = settings.cnav.clientId;
  const params = [
    { key: 'state', value: state },
    { key: 'nonce', value: nonce },
    { key: 'client_id', value: clientId },
    { key: 'redirect_uri', value: redirectUri },
    { key: 'response_type', value: 'code' },
    {
      key: 'scope',
      value: 'openid profile',
    },
  ];

  params.forEach(({ key, value }) => redirectTarget.searchParams.append(key, value));

  return { redirectTarget: redirectTarget.toString(), state, nonce };
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

function createAccessToken(userId) {
  const expirationDelaySeconds = settings.cnav.accessTokenLifespanMs / 1000;
  return jsonwebtoken.sign({ user_id: userId, source: 'cnav' }, settings.authentication.secret, {
    expiresIn: expirationDelaySeconds,
  });
}

async function _extractClaimsFromIdToken(idToken) {
  const { given_name, family_name, nonce, sub } = await jsonwebtoken.decode(idToken);
  return { given_name, family_name, nonce, sub };
}

module.exports = {
  getAuthUrl,
  getUserInfo,
  exchangeCodeForTokens,
  createAccessToken,
};
