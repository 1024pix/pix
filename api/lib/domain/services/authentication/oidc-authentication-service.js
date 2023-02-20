import jsonwebtoken from 'jsonwebtoken';
import querystring from 'querystring';
import { v4 as uuidv4 } from 'uuid';
import { InvalidExternalAPIResponseError } from '../../errors';
import AuthenticationMethod from '../../models/AuthenticationMethod';
import AuthenticationSessionContent from '../../models/AuthenticationSessionContent';
import settings from '../../../config';
import httpAgent from '../../../infrastructure/http/http-agent';
import httpErrorsHelper from '../../../infrastructure/http/errors-helper';
import DomainTransaction from '../../../infrastructure/DomainTransaction';
import monitoringTools from '../../../infrastructure/monitoring-tools';

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

      throw new InvalidExternalAPIResponseError(
        'Une erreur est survenue en récupérant les informations des utilisateurs.'
      );
    }

    const userInfoContent = response.data;

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

    const userInfoMissingFields = this.userInfoMissingFields({ userInfoContent });

    if (userInfoMissingFields) {
      monitoringTools.logErrorWithCorrelationIds({
        message: "Un des champs obligatoires n'a pas été renvoyé",
        missingFields: userInfoMissingFields,
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

  userInfoMissingFields({ userInfoContent }) {
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
    return { userId: createdUserId };
  }
}

export default OidcAuthenticationService;
