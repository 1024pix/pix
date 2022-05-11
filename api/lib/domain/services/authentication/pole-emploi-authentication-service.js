const settings = require('../../../config');
const httpAgent = require('../../../infrastructure/http/http-agent');
const querystring = require('querystring');
const { AuthenticationTokensRecoveryError } = require('../../errors');
const PoleEmploiTokens = require('../../models/PoleEmploiTokens');
const { v4: uuidv4 } = require('uuid');
const jsonwebtoken = require('jsonwebtoken');
const DomainTransaction = require('../../../infrastructure/DomainTransaction');
const AuthenticationMethod = require('../../models/AuthenticationMethod');
const moment = require('moment');

async function exchangeCodeForTokens({ code, redirectUri }) {
  const data = {
    client_secret: settings.poleEmploi.clientSecret,
    grant_type: 'authorization_code',
    code,
    client_id: settings.poleEmploi.clientId,
    redirect_uri: redirectUri,
  };

  const tokensResponse = await httpAgent.post({
    url: settings.poleEmploi.tokenUrl,
    payload: querystring.stringify(data),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  });

  if (!tokensResponse.isSuccessful) {
    const errorMessage = JSON.stringify(tokensResponse.data);
    throw new AuthenticationTokensRecoveryError(errorMessage, tokensResponse.code);
  }

  return new PoleEmploiTokens({
    accessToken: tokensResponse.data['access_token'],
    idToken: tokensResponse.data['id_token'],
    expiresIn: tokensResponse.data['expires_in'],
    refreshToken: tokensResponse.data['refresh_token'],
  });
}

async function getUserInfo({ idToken }) {
  const { given_name, family_name, nonce, idIdentiteExterne } = await _extractPayloadFromIdToken(idToken);

  return {
    firstName: given_name,
    lastName: family_name,
    externalIdentityId: idIdentiteExterne,
    nonce,
  };
}

function getAuthUrl({ redirectUri }) {
  const redirectTarget = new URL(settings.poleEmploi.authUrl);
  const state = uuidv4();
  const nonce = uuidv4();
  const clientId = settings.poleEmploi.clientId;
  const params = [
    { key: 'state', value: state },
    { key: 'nonce', value: nonce },
    { key: 'realm', value: '/individu' },
    { key: 'client_id', value: clientId },
    { key: 'redirect_uri', value: redirectUri },
    { key: 'response_type', value: 'code' },
    {
      key: 'scope',
      value: `application_${clientId} api_peconnect-individuv1 openid profile serviceDigitauxExposition api_peconnect-servicesdigitauxv1`,
    },
  ];

  params.forEach(({ key, value }) => redirectTarget.searchParams.append(key, value));

  return { redirectTarget: redirectTarget.toString(), state, nonce };
}

function createAccessToken(userId) {
  const expirationDelaySeconds = settings.poleEmploi.accessTokenLifespanMs / 1000;

  return jsonwebtoken.sign({ user_id: userId, source: 'pole_emploi_connect' }, settings.authentication.secret, {
    expiresIn: expirationDelaySeconds,
  });
}

async function _extractPayloadFromIdToken(idToken) {
  const { given_name, family_name, nonce, idIdentiteExterne } = await jsonwebtoken.decode(idToken);
  return { given_name, family_name, nonce, idIdentiteExterne };
}

async function createUserAccount({
  user,
  sessionContent,
  externalIdentityId,
  userToCreateRepository,
  authenticationMethodRepository,
}) {
  let createdUserId;
  await DomainTransaction.execute(async (domainTransaction) => {
    createdUserId = (await userToCreateRepository.create({ user, domainTransaction })).id;

    const authenticationMethod = new AuthenticationMethod({
      identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
      userId: createdUserId,
      externalIdentifier: externalIdentityId,
      authenticationComplement: new AuthenticationMethod.PoleEmploiAuthenticationComplement({
        accessToken: sessionContent.accessToken,
        refreshToken: sessionContent.refreshToken,
        expiredDate: moment().add(sessionContent.expiresIn, 's').toDate(),
      }),
    });
    await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
  });
  return {
    userId: createdUserId,
    idToken: sessionContent.idToken,
  };
}

module.exports = {
  exchangeCodeForTokens,
  getUserInfo,
  getAuthUrl,
  createAccessToken,
  createUserAccount,
};
