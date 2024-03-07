import { randomUUID } from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import lodash from 'lodash';
import { Issuer } from 'openid-client';

import { config } from '../../../../src/shared/config.js';
import { OidcError } from '../../../../src/shared/domain/errors.js';
import { logger } from '../../../../src/shared/infrastructure/utils/logger.js';
import { DomainTransaction } from '../../../infrastructure/DomainTransaction.js';
import { monitoringTools } from '../../../infrastructure/monitoring-tools.js';
import { temporaryStorage } from '../../../infrastructure/temporary-storage/index.js';
import { OIDC_ERRORS } from '../../constants.js';
import { OidcMissingFieldsError } from '../../errors.js';
import { AuthenticationMethod } from '../../models/AuthenticationMethod.js';
import { AuthenticationSessionContent } from '../../models/AuthenticationSessionContent.js';

const DEFAULT_REQUIRED_PROPERTIES = ['clientId', 'clientSecret', 'redirectUri', 'openidConfigurationUrl'];
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
      claimsToStore,
      clientId,
      clientSecret,
      configKey,
      endSessionUrl,
      extraAuthorizationUrlParameters,
      hasLogoutUrl = false,
      identityProvider,
      jwtOptions,
      openidClientExtraMetadata,
      openidConfigurationUrl,
      organizationName,
      postLogoutRedirectUri,
      redirectUri,
      scope = DEFAULT_SCOPE,
      slug,
      source,
    },
    { sessionTemporaryStorage = defaultSessionTemporaryStorage } = {},
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.configKey = configKey;
    this.endSessionUrl = endSessionUrl;
    this.extraAuthorizationUrlParameters = extraAuthorizationUrlParameters;
    this.hasLogoutUrl = hasLogoutUrl;
    this.identityProvider = identityProvider;
    this.jwtOptions = jwtOptions;
    this.openidClientExtraMetadata = openidClientExtraMetadata;
    this.openidConfigurationUrl = openidConfigurationUrl;
    this.organizationName = organizationName;
    this.postLogoutRedirectUri = postLogoutRedirectUri;
    this.redirectUri = redirectUri;
    this.scope = scope;
    this.slug = slug;
    this.source = source;

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
      const metadata = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uris: [this.redirectUri],
      };

      if (this.openidClientExtraMetadata) {
        Object.assign(metadata, this.openidClientExtraMetadata);
      }

      this.client = new issuer.Client(metadata);
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

  async exchangeCodeForTokens({ code, nonce, state, sessionState }) {
    let tokenSet;

    try {
      tokenSet = await this.client.callback(this.redirectUri, { code, state }, { nonce, state: sessionState });
    } catch (error) {
      _monitorOidcError(error.message, {
        data: { code, nonce, organizationName: this.organizationName, sessionState, state },
        error,
        event: 'exchange-code-for-tokens',
      });
      throw new OidcError({ message: error.message });
    }

    const {
      access_token: accessToken,
      expires_in: expiresIn,
      id_token: idToken,
      refresh_token: refreshToken,
    } = tokenSet;

    return new AuthenticationSessionContent({
      accessToken,
      expiresIn,
      idToken,
      refreshToken,
    });
  }

  getAuthorizationUrl() {
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

    let redirectTarget;

    try {
      redirectTarget = this.client.authorizationUrl(authorizationParameters);
    } catch (error) {
      _monitorOidcError(error.message, {
        data: { organizationName: this.organizationName },
        error,
        event: 'generate-authorization-url',
      });
      throw new OidcError({ message: error.message });
    }

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
    const key = `${userId}:${logoutUrlUUID}`;
    const idToken = await this.sessionTemporaryStorage.get(key);

    const parameters = {
      post_logout_redirect_uri: this.postLogoutRedirectUri,
      id_token_hint: idToken,
    };

    try {
      const endSessionUrl = this.client.endSessionUrl(parameters);

      await this.sessionTemporaryStorage.delete(key);

      return endSessionUrl;
    } catch (error) {
      _monitorOidcError(error.message, {
        data: { organizationName: this.organizationName },
        error,
        event: 'get-redirect-logout-url',
      });
      throw new OidcError({ message: error.message });
    }
  }

  async _getUserInfoFromEndpoint({ accessToken }) {
    let userInfo;

    try {
      userInfo = await this.client.userinfo(accessToken);
    } catch (error) {
      _monitorOidcError(error.message, {
        data: { organizationName: this.organizationName },
        error,
        event: 'get-user-info-from-endpoint',
      });
      throw new OidcError({ message: error.message });
    }

    const missingRequiredClaims = this.#findMissingRequiredClaims(userInfo);
    if (missingRequiredClaims.length > 0) {
      const message = `Un ou des champs obligatoires (${missingRequiredClaims.join(
        ',',
      )}) n'ont pas été renvoyés par votre fournisseur d'identité ${this.organizationName}.`;

      _monitorOidcError(message, {
        data: {
          missingFields: missingRequiredClaims.join(', '),
          userInfo,
        },
        event: 'find-missing-required-claims',
      });

      const error = OIDC_ERRORS.USER_INFO.missingFields;
      const meta = {
        shortCode: error.shortCode,
      };
      throw new OidcMissingFieldsError(message, error.code, meta);
    }

    const pickedUserInfo = {
      sub: userInfo.sub,
      family_name: userInfo.family_name,
      given_name: userInfo.given_name,
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

function _monitorOidcError(message, { data, error, event }) {
  const monitoringData = {
    message,
    context: 'oidc',
    data,
    event,
    team: 'acces',
  };

  if (error) {
    monitoringData.error = { name: error.constructor.name };
    error.error_uri && Object.assign(monitoringData.error, { errorUri: error.error_uri });
    error.response && Object.assign(monitoringData.error, { response: error.response });
  }

  monitoringTools.logErrorWithCorrelationIds(monitoringData);
}
