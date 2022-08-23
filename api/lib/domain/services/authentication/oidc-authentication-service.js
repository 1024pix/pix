const jsonwebtoken = require('jsonwebtoken');
const settings = require('../../../config');
const httpAgent = require('../../../infrastructure/http/http-agent');
const querystring = require('querystring');
const { AuthenticationTokenRetrievalError, InvalidExternalAPIResponseError } = require('../../errors');
const AuthenticationSessionContent = require('../../models/AuthenticationSessionContent');
const { v4: uuidv4 } = require('uuid');
const DomainTransaction = require('../../../infrastructure/DomainTransaction');
const AuthenticationMethod = require('../../models/AuthenticationMethod');
const logger = require('../../../infrastructure/logger');

class OidcAuthenticationService {
  constructor({
    source,
    identityProvider,
    jwtOptions,
    clientSecret,
    clientId,
    tokenUrl,
    authenticationUrl,
    authenticationUrlParameters,
    userInfoUrl,
  }) {
    this.source = source;
    this.identityProvider = identityProvider;
    this.jwtOptions = jwtOptions;
    this.clientSecret = clientSecret;
    this.clientId = clientId;
    this.tokenUrl = tokenUrl;
    this.authenticationUrl = authenticationUrl;
    this.authenticationUrlParameters = authenticationUrlParameters;
    this.userInfoUrl = userInfoUrl;
  }

  get code() {
    return this.identityProvider;
  }

  createAccessToken(userId) {
    return jsonwebtoken.sign(
      {
        user_id: userId,
        source: this.source,
        identity_provider: this.identityProvider,
      },
      settings.authentication.secret,
      this.jwtOptions
    );
  }

  createAuthenticationComplement() {
    return null;
  }

  saveIdToken() {
    return null;
  }

  async exchangeCodeForTokens({ code, redirectUri }) {
    const data = {
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
      code,
      client_id: this.clientId,
      redirect_uri: redirectUri,
    };

    const response = await httpAgent.post({
      url: this.tokenUrl,
      payload: querystring.stringify(data),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });

    if (!response.isSuccessful) {
      const errorMessage = JSON.stringify(response.data);
      throw new AuthenticationTokenRetrievalError(errorMessage, response.code);
    }

    return new AuthenticationSessionContent({
      idToken: response.data['id_token'],
      accessToken: response.data['access_token'],
      expiresIn: response.data['expires_in'],
      refreshToken: response.data['refresh_token'],
    });
  }

  getAuthenticationUrl({ redirectUri }) {
    const redirectTarget = new URL(this.authenticationUrl);
    const state = uuidv4();
    const nonce = uuidv4();

    const params = [
      { key: 'state', value: state },
      { key: 'nonce', value: nonce },
      { key: 'client_id', value: this.clientId },
      { key: 'redirect_uri', value: redirectUri },
      { key: 'response_type', value: 'code' },
      ...this.authenticationUrlParameters,
    ];

    params.forEach(({ key, value }) => redirectTarget.searchParams.append(key, value));

    return { redirectTarget: redirectTarget.toString(), state, nonce };
  }

  async _getContentFromUserInfoEndpoint({ accessToken, userInfoUrl }) {
    let userInfoContent;

    try {
      const { data } = await httpAgent.get({
        url: userInfoUrl,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      userInfoContent = data;
    } catch (error) {
      logger.error('Une erreur est survenue en récupérant les information des utilisateurs.');
      throw new InvalidExternalAPIResponseError(
        'Une erreur est survenue en récupérant les information des utilisateurs'
      );
    }

    if (!userInfoContent.family_name || !userInfoContent.given_name || !userInfoContent.sub) {
      logger.error(`Un des champs obligatoires n'a pas été renvoyé : ${JSON.stringify(userInfoContent)}.`);
      throw new InvalidExternalAPIResponseError('Les informations utilisateurs récupérées sont incorrectes.');
    }

    return {
      given_name: userInfoContent?.given_name,
      family_name: userInfoContent?.family_name,
      sub: userInfoContent?.sub,
      nonce: userInfoContent?.nonce,
    };
  }

  async getUserInfo({ idToken, accessToken }) {
    const { family_name, given_name, sub, nonce } = await jsonwebtoken.decode(idToken);
    let userInfoContent;

    if (!family_name || !given_name || !sub) {
      userInfoContent = await this._getContentFromUserInfoEndpoint({ accessToken, userInfoUrl: this.userInfoUrl });
    }

    return {
      firstName: given_name || userInfoContent?.given_name,
      lastName: family_name || userInfoContent?.family_name,
      externalIdentityId: sub || userInfoContent?.sub,
      nonce: nonce || userInfoContent?.nonce,
    };
  }

  async createUserAccount({ user, externalIdentityId, userToCreateRepository, authenticationMethodRepository }) {
    let createdUserId;
    await DomainTransaction.execute(async (domainTransaction) => {
      createdUserId = (await userToCreateRepository.create({ user, domainTransaction })).id;

      const authenticationMethod = new AuthenticationMethod({
        identityProvider: this.identityProvider,
        userId: createdUserId,
        externalIdentifier: externalIdentityId,
      });
      await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
    });
    return { userId: createdUserId };
  }
}

module.exports = OidcAuthenticationService;
