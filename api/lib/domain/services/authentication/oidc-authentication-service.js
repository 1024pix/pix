const jsonwebtoken = require('jsonwebtoken');
const settings = require('../../../config');
const httpAgent = require('../../../infrastructure/http/http-agent');
const querystring = require('querystring');
const { InvalidExternalAPIResponseError } = require('../../errors');
const AuthenticationSessionContent = require('../../models/AuthenticationSessionContent');
const { v4: uuidv4 } = require('uuid');
const DomainTransaction = require('../../../infrastructure/DomainTransaction');
const AuthenticationMethod = require('../../models/AuthenticationMethod');
const monitoringTools = require('../../../infrastructure/monitoring-tools');

class OidcAuthenticationService {
  constructor({
    source,
    identityProvider,
    slug,
    organizationName,
    hasLogoutUrl = false,
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
    this.slug = slug;
    this.hasLogoutUrl = hasLogoutUrl;
    this.organizationName = organizationName;
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
    return jsonwebtoken.sign({ user_id: userId }, settings.authentication.secret, this.jwtOptions);
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
      const errorResponse = JSON.stringify(response.data);
      const message = 'Erreur lors de la récupération des tokens du partenaire.';
      const dataToLog = {
        message,
        errorDescription: errorResponse.error_description,
        errorType: errorResponse.error,
      };
      monitoringTools.logErrorWithCorrelationIds({ message: dataToLog });
      throw new InvalidExternalAPIResponseError(message);
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

  _validateUserInfoContent({ userInfoContent }) {
    const missingFields = [];
    if (!userInfoContent.family_name) {
      missingFields.push('family_name');
    }
    if (!userInfoContent.given_name) {
      missingFields.push('given_name');
    }
    if (!userInfoContent.sub) {
      missingFields.push('sub');
    }
    const thereIsAtLeastOneRequiredMissingField = missingFields.length > 0;
    if (thereIsAtLeastOneRequiredMissingField) {
      throw new InvalidExternalAPIResponseError(missingFields.join(','));
    }
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
      error.customMessage = 'Une erreur est survenue en récupérant les information des utilisateurs.';
      monitoringTools.logErrorWithCorrelationIds({ message: error });
      throw new InvalidExternalAPIResponseError(
        'Une erreur est survenue en récupérant les information des utilisateurs.'
      );
    }

    if (!userInfoContent || typeof userInfoContent !== 'object') {
      const message = 'Les informations utilisateur récupérées ne sont pas au format attendu.';
      const dataToLog = {
        message,
        typeOfUserInfoContent: typeof userInfoContent,
        userInfoContent,
      };
      monitoringTools.logErrorWithCorrelationIds({ message: dataToLog });
      throw new InvalidExternalAPIResponseError(message);
    }

    try {
      this._validateUserInfoContent({ userInfoContent });
    } catch (error) {
      monitoringTools.logErrorWithCorrelationIds({
        message: "Un des champs obligatoires n'a pas été renvoyé",
        missingFields: error,
      });
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
