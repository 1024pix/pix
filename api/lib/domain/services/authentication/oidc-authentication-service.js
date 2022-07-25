const jsonwebtoken = require('jsonwebtoken');
const settings = require('../../../config');
const httpAgent = require('../../../infrastructure/http/http-agent');
const querystring = require('querystring');
const { AuthenticationTokenRetrievalError } = require('../../errors');
const AuthenticationSessionContent = require('../../models/AuthenticationSessionContent');
const { v4: uuidv4 } = require('uuid');

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
  }) {
    this.source = source;
    this.identityProvider = identityProvider;
    this.jwtOptions = jwtOptions;
    this.clientSecret = clientSecret;
    this.clientId = clientId;
    this.tokenUrl = tokenUrl;
    this.authenticationUrl = authenticationUrl;
    this.authenticationUrlParameters = authenticationUrlParameters;
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
}

module.exports = OidcAuthenticationService;
