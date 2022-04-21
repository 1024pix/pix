const get = require('lodash/get');
const settings = require('../../config');
const { v4: uuidv4 } = require('uuid');
const tokenService = require('./token-service');
const httpAgent = require('../../infrastructure/http/http-agent');
const querystring = require('querystring');
const { GenerateCnavTokensError } = require('../errors');
const CnavTokens = require('../models/CnavTokens');

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
    throw new GenerateCnavTokensError(errorMessage, tokensResponse.code);
  }

  return new CnavTokens({
    accessToken: tokensResponse.data['access_token'],
    idToken: tokensResponse.data['id_token'],
    expiresIn: tokensResponse.data['expires_in'],
    refreshToken: tokensResponse.data['refresh_token'],
  });
}

async function getUserInfo(idToken) {
  const { given_name, family_name, nonce, sub } = await tokenService.extractClaimsFromCnavIdToken(idToken);

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

module.exports = {
  getAuthUrl,
  getUserInfo,
  exchangeCodeForTokens,
};
