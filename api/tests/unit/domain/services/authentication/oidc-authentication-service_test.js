import { expect, sinon, catchErr } from '../../../../test-helper.js';
import { config as settings } from '../../../../../lib/config.js';

import { OidcAuthenticationService } from '../../../../../lib/domain/services/authentication/oidc-authentication-service.js';
import jsonwebtoken from 'jsonwebtoken';
import { httpAgent } from '../../../../../lib/infrastructure/http/http-agent.js';
import { AuthenticationSessionContent } from '../../../../../lib/domain/models/AuthenticationSessionContent.js';

import {
  InvalidExternalAPIResponseError,
  OidcInvokingTokenEndpointError,
  OidcMissingFieldsError,
  OidcUserInfoFormatError,
} from '../../../../../lib/domain/errors.js';

import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { UserToCreate } from '../../../../../lib/domain/models/UserToCreate.js';
import { AuthenticationMethod } from '../../../../../lib/domain/models/AuthenticationMethod.js';
import * as OidcIdentityProviders from '../../../../../lib/domain/constants/oidc-identity-providers.js';
import { monitoringTools } from '../../../../../lib/infrastructure/monitoring-tools.js';
import { OIDC_ERRORS } from '../../../../../lib/domain/constants.js';

describe('Unit | Domain | Services | oidc-authentication-service', function () {
  describe('constructor', function () {
    context('when claimsToStore is undefined', function () {
      it('does not set claimsToStore', async function () {
        // given
        const args = {};

        // when
        const oidcAuthenticationService = new OidcAuthenticationService(args);

        // then
        expect(oidcAuthenticationService.claimsToStore).not.to.exist;
      });
    });

    context('when claimsToStore is null', function () {
      it('does not set claimsToStore', async function () {
        // given
        const args = { claimsToStore: null };

        // when
        const oidcAuthenticationService = new OidcAuthenticationService(args);

        // then
        expect(oidcAuthenticationService.claimsToStore).not.to.exist;
      });
    });

    context('when claimsToStore is an empty array', function () {
      it('does not set claimsToStore', async function () {
        // given
        const args = { claimsToStore: [] };

        // when
        const oidcAuthenticationService = new OidcAuthenticationService(args);

        // then
        expect(oidcAuthenticationService.claimsToStore).not.to.exist;
      });
    });

    context('when claimsToStore is not empty', function () {
      it('sets claimsToStore', async function () {
        // given
        const args = { claimsToStore: ['employeeNumber', 'studentGroup'] };

        // when
        const oidcAuthenticationService = new OidcAuthenticationService(args);

        // then
        expect(oidcAuthenticationService.claimsToStore).to.exist;
      });
    });
  });

  describe('#isReady', function () {
    describe('when configKey is set', function () {
      describe('when enabled in config', function () {
        describe('when config is valid', function () {
          it('returns true', function () {
            // given
            settings.someOidcProviderService = {
              isEnabled: true,
              clientId: 'anId',
              clientSecret: 'aSecret',
              authenticationUrl: 'https://example.net',
              userInfoUrl: 'https://example.net',
              tokenUrl: 'https://example.net',
              aProperty: 'aValue',
            };
            const oidcAuthenticationService = new OidcAuthenticationService({
              configKey: 'someOidcProviderService',
              additionalRequiredProperties: ['aProperty'],
            });

            // when
            const result = oidcAuthenticationService.isReady;

            // then
            expect(result).to.be.true;
          });
        });

        describe('when config is invalid', function () {
          it('returns false', function () {
            // given
            settings.someOidcProviderService = {
              isEnabled: true,
            };
            const oidcAuthenticationService = new OidcAuthenticationService({
              configKey: 'someOidcProviderService',
            });

            // when
            const result = oidcAuthenticationService.isReady;

            // then
            expect(result).to.be.false;
          });
        });
      });

      describe('when not enabled in config', function () {
        it('returns false', function () {
          // given
          settings.someOidcProviderService = {
            isEnabled: false,
          };
          const oidcAuthenticationService = new OidcAuthenticationService({
            configKey: 'someOidcProviderService',
          });

          // when
          const result = oidcAuthenticationService.isReady;

          // then
          expect(result).to.be.false;
        });
      });
    });

    describe('when configKey is not set', function () {
      it('returns false', function () {
        // given
        settings.someOidcProviderService = {
          isEnabled: true,
        };
        const oidcAuthenticationService = new OidcAuthenticationService({});

        // when
        const result = oidcAuthenticationService.isReady;

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#createAccessToken', function () {
    it('should create access token with user id', function () {
      // given
      const userId = 42;
      const accessToken = Symbol('valid access token');
      settings.authentication.secret = 'a secret';
      const payload = { user_id: userId };
      const secret = 'a secret';
      const jwtOptions = { expiresIn: 1 };
      sinon.stub(jsonwebtoken, 'sign').withArgs(payload, secret, jwtOptions).returns(accessToken);

      const oidcAuthenticationService = new OidcAuthenticationService({ jwtOptions });

      // when
      const result = oidcAuthenticationService.createAccessToken(userId);

      // then
      expect(result).to.equal(accessToken);
    });
  });

  describe('#createAuthenticationComplement', function () {
    it('should return null', function () {
      // given
      const oidcAuthenticationService = new OidcAuthenticationService({});

      // when
      const result = oidcAuthenticationService.createAuthenticationComplement();

      // then
      expect(result).to.be.null;
    });
  });

  describe('#saveIdToken', function () {
    it('should return null', async function () {
      // given
      const oidcAuthenticationService = new OidcAuthenticationService({});

      // when
      const result = await oidcAuthenticationService.saveIdToken();

      // then
      expect(result).to.be.null;
    });
  });

  describe('#getRedirectLogoutUrl', function () {
    context('when there is no endSessionEndpoint', function () {
      it('returns null', async function () {
        // given
        const oidcAuthenticationService = new OidcAuthenticationService({});

        // when
        const result = await oidcAuthenticationService.getRedirectLogoutUrl();

        // then
        expect(result).to.be.null;
      });
    });

    context('when there is an endSessionEndpoint', function () {
      it('returns a redirect URL for the user browser', async function () {
        // given
        const idToken = 'some_dummy_id_token';
        const userId = 'some_dummy_user_id';
        const logoutUrlUUID = 'some_dummy_logout_url_uuid';
        const sessionTemporaryStorage = {
          get: sinon.stub().resolves(idToken),
          delete: sinon.stub().resolves(),
        };
        settings.someOidcProviderService = {
          isEnabled: true,
          clientId: 'anId',
          clientSecret: 'aSecret',
          authenticationUrl: 'https://example.net/authorize',
          tokenUrl: 'https://example.net/token',
          userInfoUrl: 'https://example.net/userinfo',
        };
        const oidcAuthenticationService = new OidcAuthenticationService(
          {
            configKey: 'someOidcProviderService',
            endSessionUrl: 'https://example.net/logout',
            postLogoutRedirectUri: 'https://app.pix.fr/connexion',
          },
          { sessionTemporaryStorage },
        );

        // when
        const result = await oidcAuthenticationService.getRedirectLogoutUrl({ userId, logoutUrlUUID });

        // then
        expect(result).to.equal(
          'https://example.net/logout?post_logout_redirect_uri=https%3A%2F%2Fapp.pix.fr%2Fconnexion&id_token_hint=some_dummy_id_token',
        );
      });
    });
  });

  describe('#_getUserInfoMissingFields', function () {
    it('should return a message with missing fields list', async function () {
      // given
      const oidcAuthenticationService = new OidcAuthenticationService({});

      // when
      const response = oidcAuthenticationService._getUserInfoMissingFields({
        userInfoContent: {
          given_name: 'givenName',
          family_name: undefined,
          nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
          sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
        },
      });

      // then
      expect(response).to.equal('Champs manquants : family_name');
    });

    it('should return false', async function () {
      // given
      const oidcAuthenticationService = new OidcAuthenticationService({});

      // when
      const response = oidcAuthenticationService._getUserInfoMissingFields({
        userInfoContent: {
          given_name: 'givenName',
          family_name: 'familyName',
          nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
          sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
        },
      });

      // then
      expect(response).to.equal(false);
    });
  });

  describe('#exchangeCodeForTokens', function () {
    it('should return id token', async function () {
      // given
      const clientId = 'OIDC_CLIENT_ID';
      const tokenUrl = 'http://oidc.net/api/token';
      const clientSecret = 'OIDC_CLIENT_SECRET';
      const accessToken = Symbol('access token');
      const expiresIn = Symbol(60);
      const idToken = Symbol('idToken');
      const refreshToken = Symbol('refreshToken');

      const oidcAuthenticationSessionContent = new AuthenticationSessionContent({
        idToken,
        accessToken,
        expiresIn,
        refreshToken,
      });

      sinon.stub(httpAgent, 'post');
      httpAgent.post.resolves({
        isSuccessful: true,
        data: {
          id_token: oidcAuthenticationSessionContent.idToken,
          access_token: oidcAuthenticationSessionContent.accessToken,
          refresh_token: oidcAuthenticationSessionContent.refreshToken,
          expires_in: oidcAuthenticationSessionContent.expiresIn,
        },
      });

      const oidcAuthenticationService = new OidcAuthenticationService({ clientSecret, clientId, tokenUrl });

      // when
      const result = await oidcAuthenticationService.exchangeCodeForTokens({
        code: 'AUTH_CODE',
        redirectUri: 'pix.net/connexion/oidc',
      });

      // then
      const expectedData = `client_secret=OIDC_CLIENT_SECRET&grant_type=authorization_code&code=AUTH_CODE&client_id=OIDC_CLIENT_ID&redirect_uri=pix.net%2Fconnexion%2Foidc`;
      const expectedHeaders = { 'content-type': 'application/x-www-form-urlencoded' };

      expect(httpAgent.post).to.have.been.calledWithExactly({
        url: 'http://oidc.net/api/token',
        payload: expectedData,
        headers: expectedHeaders,
        timeout: settings.partner.fetchTimeOut,
      });
      expect(result).to.be.an.instanceOf(AuthenticationSessionContent);
      expect(result).to.deep.equal(oidcAuthenticationSessionContent);
    });

    context('when tokens retrieval fails', function () {
      it('should log error and throw InvalidExternalAPIResponseError', async function () {
        // given
        const clientId = 'OIDC_CLIENT_ID';
        const tokenUrl = 'http://oidc.net/api/token';
        const clientSecret = 'OIDC_CLIENT_SECRET';
        const errorResponse = {
          isSuccessful: false,
          code: 400,
          data: {
            error: 'invalid_client',
            error_description: 'Invalid authentication method for accessing this endpoint.',
          },
        };
        const identityProvider = 'IDENTITY_PROVIDER_TEST';

        sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');
        sinon.stub(httpAgent, 'post');
        httpAgent.post.resolves(errorResponse);

        const oidcAuthenticationService = new OidcAuthenticationService({
          clientSecret,
          clientId,
          identityProvider,
          tokenUrl,
        });

        // when
        const payload = {
          code: 'AUTH_CODE',
          redirectUri: 'pix.net/connexion/oidc',
        };
        const error = await catchErr(
          oidcAuthenticationService.exchangeCodeForTokens,
          oidcAuthenticationService,
        )(payload);

        // then
        const expectedPayload = {
          code: payload.code,
          redirect_uri: payload.redirectUri,
          client_id: 'OIDC_CLIENT_ID',
          client_secret: 'OIDC_CLIENT_SECRET',
          grant_type: 'authorization_code',
        };

        const expectedLogOptions = {
          message: {
            code: 'EXCHANGE_CODE_FOR_TOKEN',
            customMessage: 'Erreur lors de la récupération des tokens du partenaire.',
            errorDetails: JSON.stringify(errorResponse.data),
            identityProvider,
            requestPayload: expectedPayload,
          },
        };

        expect(error).to.be.an.instanceOf(OidcInvokingTokenEndpointError);
        expect(error.message).to.equal('Erreur lors de la récupération des tokens du partenaire.');
        expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWith(expectedLogOptions);
      });
    });
  });

  describe('#getAuthenticationUrl', function () {
    it('should return authentication url', async function () {
      // given
      const authenticationUrl = 'http://authenticationurl.net';
      const clientId = 'OIDC_CLIENT_ID';
      const authenticationUrlParameters = [
        { key: 'realm', value: '/individu' },
        { key: 'scope', value: `openid profile` },
      ];
      const redirectUri = 'https://example.org/please-redirect-to-me';

      const oidcAuthenticationService = new OidcAuthenticationService({
        authenticationUrl,
        clientId,
        authenticationUrlParameters,
      });

      // when
      const { redirectTarget } = oidcAuthenticationService.getAuthenticationUrl({ redirectUri });

      // then
      const parsedRedirectTarget = new URL(redirectTarget);
      const queryParams = parsedRedirectTarget.searchParams;
      const uuidV4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
      expect(parsedRedirectTarget.protocol).to.equal('http:');
      expect(parsedRedirectTarget.hostname).to.equal('authenticationurl.net');
      expect(queryParams.get('state')).to.match(uuidV4Regex);
      expect(queryParams.get('nonce')).to.match(uuidV4Regex);
      expect(queryParams.get('client_id')).to.equal('OIDC_CLIENT_ID');
      expect(queryParams.get('redirect_uri')).to.equal('https://example.org/please-redirect-to-me');
      expect(queryParams.get('response_type')).to.equal('code');
      expect(queryParams.get('scope')).to.equal('openid profile');
      expect(queryParams.get('realm')).to.equal('/individu');
    });

    describe('when config is missing', function () {
      it('should throw an error', async function () {
        // given
        const redirectUri = 'https://example.org/please-redirect-to-me';

        const oidcAuthenticationService = new OidcAuthenticationService({});

        // when
        let errorResponse;
        try {
          await oidcAuthenticationService.getAuthenticationUrl({
            redirectUri,
          });
        } catch (error) {
          errorResponse = error;
        }

        // then
        expect(errorResponse.code).to.be.equal('ERR_INVALID_URL');
      });
    });
  });

  describe('#getUserInfo', function () {
    it('should return nonce, firstName, lastName and external identity id', async function () {
      // given
      function generateIdToken(payload) {
        return jsonwebtoken.sign(
          {
            ...payload,
          },
          'secret',
        );
      }

      const idToken = generateIdToken({
        given_name: 'givenName',
        family_name: 'familyName',
        nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
        sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
        email: 'given.family@example.net',
      });

      const oidcAuthenticationService = new OidcAuthenticationService({});

      // when
      const result = await oidcAuthenticationService.getUserInfo({
        idToken,
        accessToken: 'accessToken',
      });

      // then
      expect(result).to.deep.equal({
        firstName: 'givenName',
        lastName: 'familyName',
        nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
        externalIdentityId: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
        email: 'given.family@example.net',
      });
    });

    describe('when required properties are not returned in id token', function () {
      it('should call userInfo endpoint', async function () {
        // given
        function generateIdToken(payload) {
          return jsonwebtoken.sign(
            {
              ...payload,
            },
            'secret',
          );
        }

        const userInfoUrl = 'infoUrl';
        const idToken = generateIdToken({
          nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
          sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
        });

        const oidcAuthenticationService = new OidcAuthenticationService({ userInfoUrl });
        sinon.stub(oidcAuthenticationService, '_getUserInfoFromEndpoint');

        // when
        await oidcAuthenticationService.getUserInfo({
          idToken,
          accessToken: 'accessToken',
        });

        // then
        expect(oidcAuthenticationService._getUserInfoFromEndpoint).to.have.been.calledOnceWithExactly({
          accessToken: 'accessToken',
        });
      });
    });
  });

  describe('#_getUserInfoFromEndpoint', function () {
    // given
    const userInfoUrl = 'userInfoUrl';
    const accessToken = 'accessToken';

    it('should return nonce, firstName, lastName, email and external identity id', async function () {
      // given
      sinon
        .stub(httpAgent, 'get')
        .withArgs({
          url: userInfoUrl,
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: settings.partner.fetchTimeOut,
        })
        .resolves({
          isSuccessful: true,
          data: {
            given_name: 'givenName',
            family_name: 'familyName',
            nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
            sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
            email: 'given.family@example.net',
          },
        });

      const oidcAuthenticationService = new OidcAuthenticationService({
        userInfoUrl,
        accessToken,
      });

      // when
      const result = await oidcAuthenticationService._getUserInfoFromEndpoint({
        accessToken: 'accessToken',
        userInfoUrl: 'userInfoUrl',
      });

      // then
      expect(result).to.deep.equal({
        given_name: 'givenName',
        family_name: 'familyName',
        sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
        nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
        email: 'given.family@example.net',
      });
    });

    describe('when call to external API fails with no data details', function () {
      it('should throw error', async function () {
        // given
        sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');
        const axiosError = {
          response: {
            data: '',
            status: 400,
          },
        };
        sinon
          .stub(httpAgent, 'get')
          .withArgs({
            url: userInfoUrl,
            headers: { Authorization: `Bearer ${accessToken}` },
            timeout: settings.partner.fetchTimeOut,
          })
          .resolves({ isSuccessful: false, code: axiosError.response.status, data: axiosError.response.data });
        // See api/lib/infrastructure/http/http-agent.js to understand, axios can throw an error but httpAgent.get map it into an http response
        const oidcAuthenticationService = new OidcAuthenticationService({ userInfoUrl, accessToken });

        // when
        let errorResponse;
        try {
          await oidcAuthenticationService._getUserInfoFromEndpoint({
            accessToken: 'accessToken',
            userInfoUrl: 'userInfoUrl',
          });
        } catch (error) {
          errorResponse = error;
        }

        // then
        expect(errorResponse).to.be.instanceOf(InvalidExternalAPIResponseError);
        expect(errorResponse.message).to.be.equal(
          'Une erreur est survenue en récupérant les informations des utilisateurs.',
        );
        expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWithExactly({
          message: {
            customMessage: 'Une erreur est survenue en récupérant les informations des utilisateurs.',
            errorDetails: 'Pas de détails disponibles',
          },
        });
      });
    });

    describe('when returned value by external API is not a json object', function () {
      it('should throw error', async function () {
        // given
        sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');
        sinon
          .stub(httpAgent, 'get')
          .withArgs({
            url: userInfoUrl,
            headers: { Authorization: `Bearer ${accessToken}` },
            timeout: settings.partner.fetchTimeOut,
          })
          .resolves({
            isSuccessful: true,
            data: '',
          });
        const organizationName = 'Organization Name';
        const oidcAuthenticationService = new OidcAuthenticationService({
          userInfoUrl: 'userInfoUrl',
          organizationName,
        });

        // when
        const error = await catchErr(
          oidcAuthenticationService._getUserInfoFromEndpoint,
          oidcAuthenticationService,
        )({
          accessToken,
          userInfoUrl,
        });

        // then
        expect(error).to.be.instanceOf(OidcUserInfoFormatError);
        expect(error.message).to.be.equal(
          `Les informations utilisateur renvoyées par votre fournisseur d'identité ${organizationName} ne sont pas au format attendu.`,
        );
        expect(error.code).to.be.equal(OIDC_ERRORS.USER_INFO.badResponseFormat.code);
        expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWithExactly({
          message: {
            message: `Les informations utilisateur renvoyées par votre fournisseur d'identité ${organizationName} ne sont pas au format attendu.`,
            typeOfUserInfoContent: 'string',
            userInfoContent: '',
          },
        });
      });
    });

    describe('when required properties are not returned by external API', function () {
      it('should throw error', async function () {
        // given
        sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');
        sinon
          .stub(httpAgent, 'get')
          .withArgs({
            url: userInfoUrl,
            headers: { Authorization: `Bearer ${accessToken}` },
            timeout: settings.partner.fetchTimeOut,
          })
          .resolves({
            isSuccessful: true,
            data: {
              given_name: 'givenName',
              family_name: undefined,
              nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
              sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
            },
          });
        const organizationName = 'Organization Name';
        const oidcAuthenticationService = new OidcAuthenticationService({ userInfoUrl, accessToken, organizationName });
        const errorMessage = `Un ou des champs obligatoires (Champs manquants : family_name) n'ont pas été renvoyés par votre fournisseur d'identité ${organizationName}.`;

        // when
        const error = await catchErr(
          oidcAuthenticationService._getUserInfoFromEndpoint,
          oidcAuthenticationService,
        )({
          accessToken: 'accessToken',
          userInfoUrl: 'userInfoUrl',
        });

        // then
        expect(error).to.be.instanceOf(OidcMissingFieldsError);
        expect(error.message).to.be.equal(errorMessage);
        expect(error.code).to.be.equal(OIDC_ERRORS.USER_INFO.missingFields.code);
        expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWithExactly({
          message: errorMessage,
          missingFields: 'Champs manquants : family_name',
          userInfoContent: {
            given_name: 'givenName',
            family_name: undefined,
            nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
            sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
          },
        });
      });
    });
  });

  describe('#createUserAccount', function () {
    let userToCreateRepository, authenticationMethodRepository;
    let domainTransaction;

    beforeEach(function () {
      domainTransaction = Symbol();
      DomainTransaction.execute = (lambda) => {
        return lambda(domainTransaction);
      };

      userToCreateRepository = {
        create: sinon.stub(),
      };
      authenticationMethodRepository = {
        create: sinon.stub(),
      };
    });

    it('returns created user id', async function () {
      // given
      const externalIdentityId = '1233BBBC';
      const user = new UserToCreate({
        firstName: 'Adam',
        lastName: 'Troisjours',
      });
      const userId = 1;
      userToCreateRepository.create.withArgs({ user, domainTransaction }).resolves({ id: userId });

      const identityProvider = OidcIdentityProviders.CNAV.code;
      const expectedAuthenticationMethod = new AuthenticationMethod({
        identityProvider,
        externalIdentifier: externalIdentityId,
        userId,
      });
      const oidcAuthenticationService = new OidcAuthenticationService({ identityProvider });

      // when
      const result = await oidcAuthenticationService.createUserAccount({
        externalIdentityId,
        user,
        authenticationMethodRepository,
        userToCreateRepository,
      });

      // then
      expect(authenticationMethodRepository.create).to.have.been.calledWithExactly({
        authenticationMethod: expectedAuthenticationMethod,
        domainTransaction,
      });
      expect(result).to.equal(userId);
    });
  });
});
