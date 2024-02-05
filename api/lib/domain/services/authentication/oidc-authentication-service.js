import lodash from 'lodash';
import jsonwebtoken from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { Issuer } from 'openid-client';

import { logger } from '../../../infrastructure/logger.js';
import { InvalidExternalAPIResponseError, OidcMissingFieldsError, OidcUserInfoFormatError } from '../../errors.js';
import { AuthenticationMethod } from '../../models/AuthenticationMethod.js';
import { AuthenticationSessionContent } from '../../models/AuthenticationSessionContent.js';
import { config } from '../../../../src/shared/config.js';
import { httpAgent } from '../../../infrastructure/http/http-agent.js';
import * as httpErrorsHelper from '../../../infrastructure/http/errors-helper.js';
import { DomainTransaction } from '../../../infrastructure/DomainTransaction.js';
import { monitoringTools } from '../../../infrastructure/monitoring-tools.js';
import { OIDC_ERRORS } from '../../constants.js';
import { temporaryStorage } from '../../../infrastructure/temporary-storage/index.js';

const DEFAULT_REQUIRED_PROPERTIES = ['clientId', 'clientSecret', 'authenticationUrl', 'userInfoUrl', 'tokenUrl'];
const DEFAULT_SCOPE = 'openid profile';
const DEFAULT_REQUIRED_CLAIMS = ['sub', 'family_name', 'given_name'];

const defaultSessionTemporaryStorage = temporaryStorage.withPrefix('oidc-session:');

class OidcAuthenticationService {
  #isReady = false;
  #isReadyForPixAdmin = false;
  #requiredClaims = Array.from(DEFAULT_REQUIRED_CLAIMS);

  constructor(
    {
      additionalRequiredProperties,
      authenticationUrl,
      extraAuthorizationUrlParameters,
      claimsToStore,
      clientId,
      clientSecret,
      configKey,
      endSessionUrl,
      hasLogoutUrl = false,
      identityProvider,
      jwtOptions,
      organizationName,
      postLogoutRedirectUri,
      redirectUri,
      scope = DEFAULT_SCOPE,
      slug,
      source,
      tokenUrl,
      userInfoUrl,
      openidConfigurationUrl,
    },
    { sessionTemporaryStorage = defaultSessionTemporaryStorage } = {},
  ) {
    this.authenticationUrl = authenticationUrl;
    this.extraAuthorizationUrlParameters = extraAuthorizationUrlParameters;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.configKey = configKey;
    this.endSessionUrl = endSessionUrl;
    this.hasLogoutUrl = hasLogoutUrl;
    this.identityProvider = identityProvider;
    this.jwtOptions = jwtOptions;
    this.organizationName = organizationName;
    this.postLogoutRedirectUri = postLogoutRedirectUri;
    this.redirectUri = redirectUri;
    this.scope = scope;
    this.slug = slug;
    this.source = source;
    this.tokenUrl = tokenUrl;
    this.userInfoUrl = userInfoUrl;
    this.openidConfigurationUrl = openidConfigurationUrl;

    if (!lodash.isEmpty(claimsToStore)) {
      this.claimsToStore = claimsToStore;
      this.#requiredClaims.push(...claimsToStore);
    }
    this.sessionTemporaryStorage = sessionTemporaryStorage;

    if (!this.configKey) {
      logger.error(`${this.constructor.name}: Missing configKey`);
      return;
    }

    const isEnabledInConfig = config[this.configKey].isEnabled;
    const isEnabledForPixAdmin = config[this.configKey].isEnabledForPixAdmin;
    if (!isEnabledInConfig && !isEnabledForPixAdmin) {
      return;
    }

    const requiredProperties = Array.from(DEFAULT_REQUIRED_PROPERTIES);
    if (additionalRequiredProperties) {
      requiredProperties.push(...additionalRequiredProperties);
    }
    const missingRequiredProperties = [];
    requiredProperties.forEach((requiredProperty) => {
      if (lodash.isNil(config[this.configKey][requiredProperty])) {
        missingRequiredProperties.push(requiredProperty);
      }
    });
    const isConfigValid = missingRequiredProperties.length == 0;
    if (!isConfigValid) {
      logger.error(
        `OIDC Provider "${this.identityProvider}" has been DISABLED because of INVALID config. ` +
          `The following required properties are missing: ${missingRequiredProperties.join(', ')}`,
      );
      return;
    }

    this.temporaryStorageConfig = config[this.configKey].temporaryStorage;
    this.#isReady = isEnabledInConfig;
    this.#isReadyForPixAdmin = isEnabledForPixAdmin;
  }

  get code() {
    return this.identityProvider;
  }

  get isReady() {
    return this.#isReady;
  }

  get isReadyForPixAdmin() {
    return this.#isReadyForPixAdmin;
  }

  async createClient() {
    try {
      const issuer = await Issuer.discover(this.openidConfigurationUrl);
      this.client = new issuer.Client({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uris: [this.redirectUri],
      });
    } catch (error) {
      logger.error(`OIDC Provider "${this.identityProvider}" is UNAVAILABLE: ${error}`);
    }
  }

  createAccessToken(userId) {
    return jsonwebtoken.sign({ user_id: userId }, config.authentication.secret, this.jwtOptions);
  }

  async saveIdToken({ idToken, userId } = {}) {
    if (!(this.endSessionUrl || this.hasLogoutUrl)) {
      return null;
    }

    const uuid = randomUUID();

    const { idTokenLifespanMs } = this.temporaryStorageConfig;

    await this.sessionTemporaryStorage.save({
      key: `${userId}:${uuid}`,
      value: idToken,
      expirationDelaySeconds: idTokenLifespanMs / 1000,
    });

    return uuid;
  }

  async exchangeCodeForTokens({ code, redirectUri }) {
    const data = {
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
      code,
      client_id: this.clientId,
      redirect_uri: redirectUri,
    };

    const httpResponse = await httpAgent.post({
      url: this.tokenUrl,
      payload: querystring.stringify(data),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      timeout: config.partner.fetchTimeOut,
    });

    if (!httpResponse.isSuccessful) {
      const message = 'Erreur lors de la récupération des tokens du partenaire.';
      const dataToLog = {
        ...httpErrorsHelper.serializeHttpErrorResponse(httpResponse, message),
        code: 'EXCHANGE_CODE_FOR_TOKEN',
        requestPayload: data,
        identityProvider: this.identityProvider,
      };
      monitoringTools.logErrorWithCorrelationIds({ message: dataToLog });
      throw new OidcInvokingTokenEndpointError(message);
    }

    return new AuthenticationSessionContent({
      idToken: httpResponse.data['id_token'],
      accessToken: httpResponse.data['access_token'],
      expiresIn: httpResponse.data['expires_in'],
      refreshToken: httpResponse.data['refresh_token'],
    });
  }

  getAuthenticationUrl() {
    const state = randomUUID();
    const nonce = randomUUID();
    const authorizationParameters = {
      nonce,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      state,
    };

    if (this.extraAuthorizationUrlParameters) {
      Object.assign(authorizationParameters, this.extraAuthorizationUrlParameters);
    }

    const redirectTarget = this.client.authorizationUrl(authorizationParameters);

    return { redirectTarget, state, nonce };
  }

  async getUserInfo({ idToken, accessToken }) {
    let userInfo = jsonwebtoken.decode(idToken);
    const missingRequiredClaims = this.#findMissingRequiredClaims(userInfo);
    if (missingRequiredClaims.length > 0) {
      userInfo = await this._getUserInfoFromEndpoint({ accessToken });
    }

    const pickedUserInfo = {
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      externalIdentityId: userInfo.sub,
      nonce: userInfo.nonce,
    };

    if (this.claimsToStore) {
      this.claimsToStore.forEach((claim) => {
        pickedUserInfo[claim] = userInfo[claim];
      });
    }

    return pickedUserInfo;
  }

  async createUserAccount({
    user,
    userInfo,
    externalIdentityId,
    userToCreateRepository,
    authenticationMethodRepository,
  }) {
    let createdUserId;

    await DomainTransaction.execute(async (domainTransaction) => {
      createdUserId = (await userToCreateRepository.create({ user, domainTransaction })).id;

      const authenticationComplement = this.createAuthenticationComplement({ userInfo });
      const authenticationMethod = new AuthenticationMethod({
        identityProvider: this.identityProvider,
        userId: createdUserId,
        externalIdentifier: externalIdentityId,
        authenticationComplement,
      });
      await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
    });

    return createdUserId;
  }

  createAuthenticationComplement({ userInfo }) {
    if (!this.claimsToStore) {
      return undefined;
    }

    const claimsToStoreWithValues = Object.fromEntries(
      Object.entries(userInfo).filter(([key, _value]) => this.claimsToStore.includes(key)),
    );
    return new AuthenticationMethod.OidcAuthenticationComplement(claimsToStoreWithValues);
  }

  async getRedirectLogoutUrl({ userId, logoutUrlUUID } = {}) {
    if (!this.endSessionUrl) {
      return null;
    }

    const redirectTarget = new URL(this.endSessionUrl);
    const key = `${userId}:${logoutUrlUUID}`;
    const idToken = await this.sessionTemporaryStorage.get(key);
    const params = [
      { key: 'post_logout_redirect_uri', value: this.postLogoutRedirectUri },
      { key: 'id_token_hint', value: idToken },
    ];

    params.forEach(({ key, value }) => redirectTarget.searchParams.append(key, value));

    await this.sessionTemporaryStorage.delete(key);

    return redirectTarget.toString();
  }

  async _getUserInfoFromEndpoint({ accessToken }) {
    const httpResponse = await httpAgent.get({
      url: this.userInfoUrl,
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: config.partner.fetchTimeOut,
    });

    if (!httpResponse.isSuccessful) {
      const message = 'Une erreur est survenue en récupérant les informations des utilisateurs.';
      const dataToLog = httpErrorsHelper.serializeHttpErrorResponse(httpResponse, message);
      monitoringTools.logErrorWithCorrelationIds({ message: dataToLog });
      throw new InvalidExternalAPIResponseError(message);
    }

    const userInfo = httpResponse.data;

    if (!userInfo || typeof userInfo !== 'object') {
      const message = `Les informations utilisateur renvoyées par votre fournisseur d'identité ${this.organizationName} ne sont pas au format attendu.`;
      const dataToLog = {
        message,
        typeOfUserInfo: typeof userInfo,
        userInfo,
      };
      monitoringTools.logErrorWithCorrelationIds({ message: dataToLog });
      const error = OIDC_ERRORS.USER_INFO.badResponseFormat;
      const meta = {
        shortCode: error.shortCode,
      };
      throw new OidcUserInfoFormatError(message, error.code, meta);
    }

    const missingRequiredClaims = this.#findMissingRequiredClaims(userInfo);
    if (missingRequiredClaims.length > 0) {
      const message = `Un ou des champs obligatoires (${missingRequiredClaims.join(
        ',',
      )}) n'ont pas été renvoyés par votre fournisseur d'identité ${this.organizationName}.`;
      monitoringTools.logErrorWithCorrelationIds({
        message,
        missingFields: missingRequiredClaims.join(', '),
        userInfo,
      });
      const error = OIDC_ERRORS.USER_INFO.missingFields;
      const meta = {
        shortCode: error.shortCode,
      };
      throw new OidcMissingFieldsError(message, error.code, meta);
    }

    const pickedUserInfo = {
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
      sub: userInfo.sub,
      nonce: userInfo.nonce,
    };

    if (this.claimsToStore) {
      this.claimsToStore.forEach((claim) => {
        pickedUserInfo[claim] = userInfo[claim];
      });
    }

    return pickedUserInfo;
  }

  #findMissingRequiredClaims(userInfo) {
    return this.#requiredClaims.reduce((missingRequiredClaims, requiredClaim) => {
      if (!userInfo[requiredClaim]) {
        missingRequiredClaims.push(requiredClaim);
      }
      return missingRequiredClaims;
    }, []);
  }
}

export { OidcAuthenticationService };
