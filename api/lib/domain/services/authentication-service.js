const axios = require('axios');
const querystring = require('querystring');
const settings = require('../../config');

const encryptionService = require('./encryption-service');
const tokenService = require('./token-service');

async function getUserByUsernameAndPassword({ username, password, userRepository }) {
  const foundUser = await userRepository.getByUsernameOrEmailWithRoles(username);
  await encryptionService.check(password, foundUser.password);
  return foundUser;
}

async function generateAccessToken({ code, clientId, redirectUri }) {
  const data = {
    client_secret: settings.poleEmploi.clientSecret,
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
  };

  const response = await axios.post(
    settings.poleEmploi.tokenUrl,
    querystring.stringify(data),
    {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    },
  );

  return {
    accessToken: response.data['access_token'],
    idToken: response.data['id_token'],
    expiresIn: response.data['expires_in'],
    refreshToken: response.data['refresh_token'],
  };
}

async function getPoleEmploiUserInfo(idToken) {
  const { given_name, family_name, nonce, idIdentiteExterne } = await tokenService.extractPayloadFromPoleEmploiIdToken(idToken);

  return {
    firstName: given_name,
    lastName: family_name,
    externalIdentityId: idIdentiteExterne,
    nonce,
  };
}

module.exports = {
  generateAccessToken,
  getPoleEmploiUserInfo,
  getUserByUsernameAndPassword,
};
