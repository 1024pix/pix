const settings = require('../../../config');
const { v4: uuidv4 } = require('uuid');
const httpAgent = require('../../../infrastructure/http/http-agent');
const querystring = require('querystring');
const { AuthenticationTokenRetrievalError } = require('../../errors');
const jsonwebtoken = require('jsonwebtoken');
const { CNAV } = require('../../constants').SOURCE;
const DomainTransaction = require('../../../infrastructure/DomainTransaction');
const AuthenticationMethod = require('../../models/AuthenticationMethod');

function createAccessToken(userId) {
  const expirationDelaySeconds = settings.cnav.accessTokenLifespanMs / 1000;
  return jsonwebtoken.sign({ user_id: userId, source: CNAV }, settings.authentication.secret, {
    expiresIn: expirationDelaySeconds,
  });
}

async function exchangeCodeForIdToken({ code, redirectUri }) {
  const data = {
    client_secret: settings.cnav.clientSecret,
    grant_type: 'authorization_code',
    code,
    client_id: settings.cnav.clientId,
    redirect_uri: redirectUri,
  };

  const response = await httpAgent.post({
    url: settings.cnav.tokenUrl,
    payload: querystring.stringify(data),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  });

  if (!response.isSuccessful) {
    const errorMessage = JSON.stringify(response.data);
    throw new AuthenticationTokenRetrievalError(errorMessage, response.code);
  }

  return response.data['id_token'];
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

async function getUserInfo({ idToken }) {
  const { given_name, family_name, nonce, sub } = await _extractClaimsFromIdToken(idToken);

  return {
    firstName: given_name,
    lastName: family_name,
    externalIdentityId: sub,
    nonce,
  };
}

async function _extractClaimsFromIdToken(idToken) {
  const { given_name, family_name, nonce, sub } = await jsonwebtoken.decode(idToken);
  return { given_name, family_name, nonce, sub };
}

async function createUserAccount({ user, externalIdentityId, userToCreateRepository, authenticationMethodRepository }) {
  let createdUserId;
  await DomainTransaction.execute(async (domainTransaction) => {
    createdUserId = (await userToCreateRepository.create({ user, domainTransaction })).id;

    const authenticationMethod = new AuthenticationMethod({
      identityProvider: AuthenticationMethod.identityProviders.CNAV,
      userId: createdUserId,
      externalIdentifier: externalIdentityId,
    });
    await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
  });
  return { userId: createdUserId };
}

module.exports = {
  createAccessToken,
  exchangeCodeForIdToken,
  getAuthUrl,
  getUserInfo,
  createUserAccount,
};
