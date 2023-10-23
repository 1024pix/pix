import lodash from 'lodash';
import jsonwebtoken from 'jsonwebtoken';
import querystring from 'querystring';
import { randomUUID } from 'crypto';

import { logger } from '../../../infrastructure/logger.js';
import {
  InvalidExternalAPIResponseError,
  OidcInvokingTokenEndpointError,
  OidcMissingFieldsError,
  OidcUserInfoFormatError,
} from '../../errors.js';
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

const defaultSessionTemporaryStorage = temporaryStorage.withPrefix('oidc-session:');

class OidcAuthenticationService {
  #isReady = false;

  constructor(
    {
      identityProvider,
      configKey,
      source,
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
      endSessionUrl,
      postLogoutRedirectUri,
      additionalRequiredProperties,
    },
    { sessionTemporaryStorage = defaultSessionTemporaryStorage } = {},
  ) {
    this.identityProvider = identityProvider;
    this.configKey = configKey;
    this.source = source;
    this.slug = slug;
    this.organizationName = organizationName;
    this.hasLogoutUrl = hasLogoutUrl;
    this.jwtOptions = jwtOptions;
    this.clientSecret = clientSecret;
    this.clientId = clientId;
    this.tokenUrl = tokenUrl;
    this.authenticationUrl = authenticationUrl;
    this.authenticationUrlParameters = authenticationUrlParameters;
    this.userInfoUrl = userInfoUrl;
    this.endSessionUrl = endSessionUrl;
    this.postLogoutRedirectUri = postLogoutRedirectUri;
    this.sessionTemporaryStorage = sessionTemporaryStorage;
    if (!this.configKey) {
      logger.error(`${this.constructor.name}: Missing configKey`);
      return;
    }

    const isEnabledInConfig = config[this.configKey].isEnabled;
    if (!isEnabledInConfig) {
      return;
    }

    const requiredProperties = DEFAULT_REQUIRED_PROPERTIES;
    if (additionalRequiredProperties) {
      requiredProperties.concat(additionalRequiredProperties);
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
        `Invalid config for OIDC Provider "${
          this.identityProvider
        }": the following required properties are missing: ${missingRequiredProperties.join(', ')}`,
      );
      return;
    }

    this.temporaryStorageConfig = config[this.configKey].temporaryStorage;
    this.#isReady = true;
  }

  get code() {
    return this.identityProvider;
  }

  get isReady() {
    return this.#isReady;
  }

  createAccessToken(userId) {
    return jsonwebtoken.sign({ user_id: userId }, config.authentication.secret, this.jwtOptions);
  }

  createAuthenticationComplement() {
    return null;
  }

  async saveIdToken({ idToken, userId } = {}) {
    if (!(this.endSessionUrl || this.hasLogoutUrl)) {
      return null;
    }

    // The session ID must be unpredictable, thus we disable the entropy cache
    // See https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#session-id-entropy
    const uuid = randomUUID({ disableEntropyCache: true });

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

  getAuthenticationUrl({ redirectUri }) {
    const redirectTarget = new URL(this.authenticationUrl);
    // The session ID must be unpredictable, thus we disable the entropy cache
    // See https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#session-id-entropy
    const state = randomUUID({ disableEntropyCache: true });
    const nonce = randomUUID({ disableEntropyCache: true });

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
    const httpResponse = await httpAgent.get({
      url: userInfoUrl,
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: config.partner.fetchTimeOut,
    });

    if (!httpResponse.isSuccessful) {
      const message = 'Une erreur est survenue en récupérant les informations des utilisateurs.';
      const dataToLog = httpErrorsHelper.serializeHttpErrorResponse(httpResponse, message);
      monitoringTools.logErrorWithCorrelationIds({ message: dataToLog });
      throw new InvalidExternalAPIResponseError(message);
    }

    const userInfoContent = httpResponse.data;

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
}

export { OidcAuthenticationService };
