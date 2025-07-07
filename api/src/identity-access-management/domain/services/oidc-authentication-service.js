import { randomUUID } from 'node:crypto';

import jsonwebtoken from 'jsonwebtoken';
import lodash from 'lodash';
import ms from 'ms';
import * as client from 'openid-client';

import { config } from '../../../shared/config.js';
import { OIDC_ERRORS } from '../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { OidcError, OidcMissingFieldsError } from '../../../shared/domain/errors.js';
import { AuthenticationMethod, AuthenticationSessionContent } from '../../../shared/domain/models/index.js';
import { temporaryStorage } from '../../../shared/infrastructure/key-value-storages/index.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { DEFAULT_CLAIM_MAPPING } from '../constants/oidc-identity-providers.js';
import { ClaimManager } from '../models/ClaimManager.js';

const DEFAULT_SCOPE = 'openid profile';

const defaultSessionTemporaryStorage = temporaryStorage.withPrefix('oidc-session:');

export class OidcAuthenticationService {
  #isReady = false;
  #isReadyForPixAdmin = false;
  #openIdClient;
  #openIdClientConfig;

  constructor(
    {
      accessTokenLifespan = '48h',
      additionalRequiredProperties,
      claimsToStore,
      clientId,
      clientSecret,
      extraAuthorizationUrlParameters,
      enabled,
      enabledForPixAdmin,
      shouldCloseSession = false,
      identityProvider,
      openidClientExtraMetadata,
      openidConfigurationUrl,
      organizationName,
      postLogoutRedirectUri,
      redirectUri,
      scope = DEFAULT_SCOPE,
      slug,
      source,
      isVisible = true,
      claimMapping,
    },
    { sessionTemporaryStorage = defaultSessionTemporaryStorage, openIdClient = client } = {},
  ) {
    this.accessTokenLifespanMs = ms(accessTokenLifespan);
    this.additionalRequiredProperties = additionalRequiredProperties;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.enabled = enabled;
    this.enabledForPixAdmin = enabledForPixAdmin;
    this.extraAuthorizationUrlParameters = extraAuthorizationUrlParameters;
    this.shouldCloseSession = shouldCloseSession;
    this.identityProvider = identityProvider;
    this.openidClientExtraMetadata = openidClientExtraMetadata;
    this.openidConfigurationUrl = openidConfigurationUrl;
    this.organizationName = organizationName;
    this.postLogoutRedirectUri = postLogoutRedirectUri;
    this.redirectUri = redirectUri;
    this.scope = scope;
    this.sessionTemporaryStorage = sessionTemporaryStorage;
    this.slug = slug;
    this.source = source;
    this.isVisible = isVisible;
    this.#openIdClient = openIdClient;

    claimMapping = claimMapping || DEFAULT_CLAIM_MAPPING;

    const additionalClaims = !lodash.isEmpty(claimsToStore)
      ? claimsToStore.split(',').map((claim) => claim.trim())
      : [];

    this.claimManager = new ClaimManager({ claimMapping, additionalClaims });

    if (!enabled && !enabledForPixAdmin) {
      return;
    }

    const accessTokenLifespanSeconds = this.accessTokenLifespanMs / 1000;
    this.accessTokenJwtOptions = { expiresIn: accessTokenLifespanSeconds };
    this.sessionDurationSeconds = accessTokenLifespanSeconds;

    this.#isReady = enabled;
    this.#isReadyForPixAdmin = enabledForPixAdmin;
  }

  get code() {
    return this.identityProvider;
  }

  get isReady() {
    return this.#isReady;
  }

  set isReady(isReady) {
    this.#isReady = isReady;
  }

  get isReadyForPixAdmin() {
    return this.#isReadyForPixAdmin;
  }

  async initializeClientConfig() {
    if (this.#openIdClientConfig) return;

    try {
      const metadata = {
        client_secret: this.clientSecret,
        ...this.openidClientExtraMetadata,
      };

      this.#openIdClientConfig = await this.#openIdClient.discovery(
        new URL(this.openidConfigurationUrl),
        this.clientId,
        metadata,
      );
    } catch (error) {
      logger.error(`OIDC Provider "${this.identityProvider}" is UNAVAILABLE: ${error}`);
    }
  }

  createAccessToken({ userId, audience }) {
    return jsonwebtoken.sign(
      { user_id: userId, aud: audience },
      config.authentication.secret,
      this.accessTokenJwtOptions,
    );
  }

  async saveIdToken({ idToken, userId }) {
    const uuid = randomUUID();

    await this.sessionTemporaryStorage.save({
      key: `${userId}:${uuid}`,
      value: idToken,
      expirationDelaySeconds: this.sessionDurationSeconds,
    });

    return uuid;
  }

  async exchangeCodeForTokens({ code, state, iss, nonce, sessionState }) {
    try {
      const currentUrl = new URL(this.redirectUri);
      if (code) currentUrl.searchParams.append('code', code);
      if (state) currentUrl.searchParams.append('state', state);
      if (iss) currentUrl.searchParams.append('iss', iss);
      if (sessionState) currentUrl.searchParams.append('session_state', sessionState);

      const checks = { expectedNonce: nonce, expectedState: sessionState };

      const tokenResponse = await this.#openIdClient.authorizationCodeGrant(
        this.#openIdClientConfig,
        currentUrl,
        checks,
      );

      return new AuthenticationSessionContent({
        accessToken: tokenResponse.access_token,
        expiresIn: tokenResponse.expires_in,
        idToken: tokenResponse.id_token,
        refreshToken: tokenResponse.refresh_token,
      });
    } catch (error) {
      _monitorOidcError(error.message, {
        data: { code, nonce, organizationName: this.organizationName, sessionState, state, iss },
        error,
        event: 'exchange-code-for-tokens',
      });
      throw new OidcError({ message: error.message });
    }
  }

  getAuthorizationUrl() {
    try {
      const state = randomUUID();
      const nonce = randomUUID();
      const parameters = {
        nonce,
        redirect_uri: this.redirectUri,
        scope: this.scope,
        state,
        ...this.extraAuthorizationUrlParameters,
      };

      const redirectTarget = this.#openIdClient.buildAuthorizationUrl(this.#openIdClientConfig, parameters);

      return { redirectTarget, state, nonce };
    } catch (error) {
      _monitorOidcError(error.message, {
        data: { organizationName: this.organizationName },
        error,
        event: 'generate-authorization-url',
      });
      throw new OidcError({ message: error.message });
    }
  }

  async getUserInfo({ idToken, accessToken }) {
    let userInfo = jsonwebtoken.decode(idToken);

    if (this.claimManager.hasMissingClaims(userInfo)) {
      userInfo = await this._getUserInfoFromEndpoint({ accessToken, expectedSubject: userInfo.sub });
    }

    return {
      ...this.claimManager.mapClaims(userInfo),
      ...this.claimManager.pickAdditionalClaims(userInfo),
    };
  }

  async createUserAccount({
    user,
    userInfo,
    externalIdentityId,
    userToCreateRepository,
    authenticationMethodRepository,
  }) {
    let createdUserId;

    await DomainTransaction.execute(async () => {
      createdUserId = (await userToCreateRepository.create({ user })).id;

      const authenticationComplement = this.createAuthenticationComplement({ userInfo });
      const authenticationMethod = new AuthenticationMethod({
        identityProvider: this.identityProvider,
        userId: createdUserId,
        externalIdentifier: externalIdentityId,
        authenticationComplement,
      });
      await authenticationMethodRepository.create({ authenticationMethod });
    });

    return createdUserId;
  }

  createAuthenticationComplement({ userInfo }) {
    if (!this.claimManager.hasAdditionalClaims) return undefined;

    const claimsToStoreWithValues = this.claimManager.pickAdditionalClaims(userInfo);

    return new AuthenticationMethod.OidcAuthenticationComplement(claimsToStoreWithValues);
  }

  async getRedirectLogoutUrl({ userId, logoutUrlUUID }) {
    const key = `${userId}:${logoutUrlUUID}`;
    const idToken = await this.sessionTemporaryStorage.get(key);

    const parameters = { id_token_hint: idToken };

    if (this.postLogoutRedirectUri) {
      parameters.post_logout_redirect_uri = this.postLogoutRedirectUri;
    }

    try {
      const endSessionUrl = this.#openIdClient.buildEndSessionUrl(this.#openIdClientConfig, parameters);

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

  async _getUserInfoFromEndpoint({ accessToken, expectedSubject }) {
    let userInfo;

    try {
      userInfo = await this.#openIdClient.fetchUserInfo(this.#openIdClientConfig, accessToken, expectedSubject);
    } catch (error) {
      _monitorOidcError(error.message, {
        data: { organizationName: this.organizationName },
        error,
        event: 'get-user-info-from-endpoint',
      });
      throw new OidcError({ message: error.message });
    }

    const missingClaims = this.claimManager.getMissingMandatoryClaims(userInfo);

    if (missingClaims.length > 0) {
      const message = `Un ou des champs obligatoires (${missingClaims.join(
        ',',
      )}) n'ont pas été renvoyés par votre fournisseur d'identité ${this.organizationName}.`;

      _monitorOidcError(message, {
        data: { missingFields: missingClaims.join(', '), userInfo },
        event: 'find-missing-required-claims',
      });

      const error = OIDC_ERRORS.USER_INFO.missingFields;
      const meta = {
        shortCode: error.shortCode,
      };
      throw new OidcMissingFieldsError(message, error.code, meta);
    }

    return userInfo;
  }
}

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

  logger.error(monitoringData);
}
