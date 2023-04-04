const jsonwebtoken = require('jsonwebtoken');
const querystring = require('querystring');
const { v4: uuidv4 } = require('uuid');

const { InvalidExternalAPIResponseError, OidcMissingFieldsError, OidcUserInfoFormatError } = require('../../errors.js');
const AuthenticationMethod = require('../../models/AuthenticationMethod.js');
const AuthenticationSessionContent = require('../../models/AuthenticationSessionContent.js');
const settings = require('../../../config.js');
const httpAgent = require('../../../infrastructure/http/http-agent.js');
const httpErrorsHelper = require('../../../infrastructure/http/errors-helper.js');
const DomainTransaction = require('../../../infrastructure/DomainTransaction.js');
const monitoringTools = require('../../../infrastructure/monitoring-tools.js');
const { OIDC_ERRORS } = require('../../constants.js');

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
      timeout: settings.partner.fetchTimeOut,
    });

    if (!response.isSuccessful) {
      const message = 'Erreur lors de la récupération des tokens du partenaire.';
      const dataToLog = httpErrorsHelper.serializeHttpErrorResponse(response, message);
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

  async getUserInfoFromEndpoint({ accessToken, userInfoUrl }) {
    const response = await httpAgent.get({
      url: userInfoUrl,
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: settings.partner.fetchTimeOut,
    });

    if (!response.isSuccessful) {
      const message = 'Une erreur est survenue en récupérant les informations des utilisateurs.';
      const dataToLog = httpErrorsHelper.serializeHttpErrorResponse(response, message);
      monitoringTools.logErrorWithCorrelationIds({ message: dataToLog });
      throw new InvalidExternalAPIResponseError(message);
    }

    const userInfoContent = response.data;

    if (!userInfoContent || typeof userInfoContent !== 'object') {
      const message = `Les informations utilisateur renvoyées par votre fournisseur d'identité ${this.organizationName} ne sont pas au format attendu.`;
      const dataToLog = {
        message,
        typeOfUserInfoContent: typeof userInfoContent,
        userInfoContent,
      };
      monitoringTools.logErrorWithCorrelationIds({ message: dataToLog });
      const error = OIDC_ERRORS.USER_INFO.badResponseFormat;
      const meta = {
        shortCode: error.shortCode,
      };
      throw new OidcUserInfoFormatError(message, error.code, meta);
    }

    const userInfoMissingFields = this.getUserInfoMissingFields({ userInfoContent });
    const message = `Un ou des champs obligatoires (${userInfoMissingFields}) n'ont pas été renvoyés par votre fournisseur d'identité ${this.organizationName}.`;

    if (userInfoMissingFields) {
      monitoringTools.logErrorWithCorrelationIds({
        message,
        missingFields: userInfoMissingFields,
        userInfoContent,
      });
      const error = OIDC_ERRORS.USER_INFO.missingFields;
      const meta = {
        shortCode: error.shortCode,
      };
      throw new OidcMissingFieldsError(message, error.code, meta);
    }

    return {
      given_name: userInfoContent?.given_name,
      family_name: userInfoContent?.family_name,
      sub: userInfoContent?.sub,
      nonce: userInfoContent?.nonce,
    };
  }

  getUserInfoMissingFields({ userInfoContent }) {
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
    return thereIsAtLeastOneRequiredMissingField ? `Champs manquants : ${missingFields.join(',')}` : false;
  }

  async getUserInfo({ idToken, accessToken }) {
    const { family_name, given_name, sub, nonce } = await jsonwebtoken.decode(idToken);
    let userInfoContent;

    const isMandatoryUserInfoMissing = !family_name || !given_name || !sub;

    if (isMandatoryUserInfoMissing) {
      userInfoContent = await this.getUserInfoFromEndpoint({ accessToken, userInfoUrl: this.userInfoUrl });
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

    return createdUserId;
  }
}

module.exports = OidcAuthenticationService;
