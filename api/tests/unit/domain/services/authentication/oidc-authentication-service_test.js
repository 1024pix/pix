import { Issuer } from 'openid-client';

import { expect, sinon, catchErr, catchErrSync } from '../../../../test-helper.js';

import { config as settings } from '../../../../../lib/config.js';
import { OidcAuthenticationService } from '../../../../../lib/domain/services/authentication/oidc-authentication-service.js';
import jsonwebtoken from 'jsonwebtoken';
import { httpAgent } from '../../../../../lib/infrastructure/http/http-agent.js';

import { AuthenticationSessionContent } from '../../../../../lib/domain/models/AuthenticationSessionContent.js';

import {
  InvalidExternalAPIResponseError,
  OidcMissingFieldsError,
  OidcUserInfoFormatError,
} from '../../../../../lib/domain/errors.js';
import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { UserToCreate } from '../../../../../lib/domain/models/UserToCreate.js';
import { AuthenticationMethod } from '../../../../../lib/domain/models/AuthenticationMethod.js';
import * as OidcIdentityProviders from '../../../../../lib/domain/constants/oidc-identity-providers.js';
import { logger } from '../../../../../lib/infrastructure/logger.js';
import { monitoringTools } from '../../../../../lib/infrastructure/monitoring-tools.js';
import { OIDC_ERRORS } from '../../../../../lib/domain/constants.js';
import { OidcError } from '../../../../../src/shared/domain/errors.js';

describe('Unit | Domain | Services | oidc-authentication-service', function () {
  describe('constructor', function () {
    context('when no parameter provided', function () {
      it('creates an instance with default values', function () {
        // given
        const args = {};

        // when
        const oidcAuthenticationService = new OidcAuthenticationService(args);

        // then
        expect(oidcAuthenticationService.hasLogoutUrl).to.be.false;
        expect(oidcAuthenticationService.scope).to.equal('openid profile');
      });
    });

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
              redirectUri: 'https://example.net/connexion/redirect',
              openidConfigurationUrl: 'https://example.net/.well-known/openid-configuration',
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
            sinon.stub(logger, 'error');

            settings.someOidcProviderService = {
              isEnabled: true,
            };
            const oidcAuthenticationService = new OidcAuthenticationService({
              configKey: 'someOidcProviderService',
              identityProvider: 'Example OP code',
              additionalRequiredProperties: ['exampleProperty'],
            });

            // when
            const result = oidcAuthenticationService.isReady;

            // then
            expect(logger.error).to.have.been.calledWithExactly(
              'OIDC Provider "Example OP code" has been DISABLED because of INVALID config. The following required properties are missing: clientId, clientSecret, redirectUri, openidConfigurationUrl, authenticationUrl, userInfoUrl, tokenUrl, exampleProperty',
            );
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
    context('when claimsToStore is empty', function () {
      it('returns undefined', function () {
        // given
        const userInfo = {};
        const identityProvider = OidcIdentityProviders.PAYSDELALOIRE.code;
        const oidcAuthenticationService = new OidcAuthenticationService({ identityProvider });

        // when
        const result = oidcAuthenticationService.createAuthenticationComplement({ userInfo });

        // then
        expect(result).to.be.undefined;
      });
    });

    context('when claimsToStore is not empty', function () {
      it('returns an OidcAuthenticationComplement', function () {
        // given
        const family_name = 'TITEGOUTTE';
        const given_name = 'Mélusine';
        const claimsToStore = ['family_name', 'given_name'];
        const claimsToStoreWithValues = { family_name, given_name };
        const userInfo = { ...claimsToStoreWithValues };
        const identityProvider = OidcIdentityProviders.FWB.code;
        const oidcAuthenticationService = new OidcAuthenticationService({ identityProvider, claimsToStore });

        // when
        const result = oidcAuthenticationService.createAuthenticationComplement({ userInfo });

        // then
        expect(result).to.be.instanceOf(AuthenticationMethod.OidcAuthenticationComplement);
      });
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

  describe('#exchangeCodeForTokens', function () {
    it('returns an AuthenticationSessionContent instance', async function () {
      // given
      const clientId = 'OIDC_CLIENT_ID';
      const tokenUrl = 'https://oidc.net/api/token';
      const clientSecret = 'OIDC_CLIENT_SECRET';
      const redirectUri = 'https://oidc.net/connexion/redirect';
      const openidConfigurationUrl = 'https://oidc.net/.well-known/openid-configuration';
      const accessToken = Symbol('access token');
      const expiresIn = Symbol(60);
      const idToken = Symbol('idToken');
      const refreshToken = Symbol('refreshToken');
      const code = Symbol('AUTHORIZATION_CODE');
      const state = Symbol('STATE');
      const nonce = Symbol('NONCE');
      const oidcAuthenticationSessionContent = new AuthenticationSessionContent({
        idToken,
        accessToken,
        expiresIn,
        refreshToken,
      });
      const tokenSet = {
        access_token: accessToken,
        expires_in: expiresIn,
        id_token: idToken,
        refresh_token: refreshToken,
      };
      const clientInstance = { callback: sinon.stub().resolves(tokenSet) };
      const Client = sinon.stub().returns(clientInstance);

      sinon.stub(Issuer, 'discover').resolves({ Client });

      const oidcAuthenticationService = new OidcAuthenticationService({
        clientSecret,
        clientId,
        redirectUri,
        openidConfigurationUrl,
        tokenUrl,
      });
      await oidcAuthenticationService.createClient();

      // when
      const result = await oidcAuthenticationService.exchangeCodeForTokens({
        code,
        nonce,
        state,
      });

      // then
      expect(result).to.be.an.instanceOf(AuthenticationSessionContent);
      expect(result).to.deep.equal(oidcAuthenticationSessionContent);
    });

    context('when OpenId Client callback fails', function () {
      it('throws an error', async function () {
        const clientId = Symbol('clientId');
        const clientSecret = Symbol('clientSecret');
        const configKey = 'identityProviderConfigKey';
        const identityProvider = Symbol('identityProvider');
        const redirectUri = Symbol('redirectUri');
        const openidConfigurationUrl = Symbol('openidConfigurationUrl');

        sinon.stub(settings, 'identityProviderConfigKey').value({});

        const Client = sinon.stub().returns({ callback: sinon.stub().rejects(new Error('Fails to get tokens')) });

        sinon.stub(Issuer, 'discover').resolves({ Client });

        const oidcAuthenticationService = new OidcAuthenticationService({
          clientId,
          clientSecret,
          configKey,
          identityProvider,
          redirectUri,
          openidConfigurationUrl,
        });
        await oidcAuthenticationService.createClient();

        // when
        const error = await catchErr(oidcAuthenticationService.exchangeCodeForTokens, oidcAuthenticationService)({});

        // then
        expect(error).to.be.instanceOf(OidcError);
        expect(error.message).to.be.equal('Fails to get tokens');
      });
    });
  });

  describe('#getAuthenticationUrl', function () {
    it('returns oidc provider authentication url', async function () {
      // given
      const authenticationUrl = 'http://authenticationurl.net';
      const clientId = 'OIDC_CLIENT_ID';
      const clientSecret = 'OIDC_CLIENT_SECRET';
      const redirectUri = 'https://example.org/please-redirect-to-me';

      const oidcAuthenticationService = new OidcAuthenticationService({
        authenticationUrl,
        clientId,
        clientSecret,
        redirectUri,
      });

      const clientInstance = { authorizationUrl: sinon.stub().returns('') };
      const Client = sinon.stub().returns(clientInstance);

      sinon.stub(Issuer, 'discover').resolves({ Client });
      await oidcAuthenticationService.createClient();

      // when
      const { nonce, state } = oidcAuthenticationService.getAuthenticationUrl();

      // then
      const uuidV4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
      expect(nonce).to.match(uuidV4Regex);
      expect(state).to.match(uuidV4Regex);

      expect(clientInstance.authorizationUrl).to.have.been.calledWithExactly({
        nonce,
        redirect_uri: 'https://example.org/please-redirect-to-me',
        scope: 'openid profile',
        state,
      });
    });

    context('when generating the authorization url fails', function () {
      it('throws an error', async function () {
        // given
        const clientId = Symbol('clientId');
        const clientSecret = Symbol('clientSecret');
        const configKey = 'identityProviderConfigKey';
        const identityProvider = Symbol('identityProvider');
        const redirectUri = Symbol('redirectUri');
        const openidConfigurationUrl = Symbol('openidConfigurationUrl');
        sinon.stub(settings, 'identityProviderConfigKey').value({});
        const Client = sinon
          .stub()
          .returns({ authorizationUrl: sinon.stub().throws(new Error('Fails to generate authorization url')) });
        sinon.stub(Issuer, 'discover').resolves({ Client });

        const oidcAuthenticationService = new OidcAuthenticationService({
          clientId,
          clientSecret,
          configKey,
          identityProvider,
          redirectUri,
          openidConfigurationUrl,
        });
        await oidcAuthenticationService.createClient();

        // when
        const error = catchErrSync(oidcAuthenticationService.getAuthenticationUrl, oidcAuthenticationService)();

        // then
        expect(error).to.be.instanceOf(OidcError);
        expect(error.message).to.be.equal('Fails to generate authorization url');
      });
    });
  });

  describe('#getUserInfo', function () {
    it('returns firstName, lastName and external identity id', async function () {
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
        externalIdentityId: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
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
        sinon.stub(oidcAuthenticationService, '_getUserInfoFromEndpoint').resolves({});

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
    it('returns firstName, lastName and external identity id', async function () {
      // given
      const authenticationUrl = 'http://authenticationurl.net';
      const clientId = 'OIDC_CLIENT_ID';
      const clientSecret = 'OIDC_CLIENT_SECRET';
      const redirectUri = 'https://example.org/please-redirect-to-me';

      const oidcAuthenticationService = new OidcAuthenticationService({
        authenticationUrl,
        clientId,
        clientSecret,
        redirectUri,
      });

      const clientInstance = {
        userinfo: sinon.stub().resolves({
          sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
          given_name: 'givenName',
          family_name: 'familyName',
        }),
      };
      const Client = sinon.stub().returns(clientInstance);

      sinon.stub(Issuer, 'discover').resolves({ Client });
      await oidcAuthenticationService.createClient();

      const accessToken = 'thisIsSerializedInformation';

      // when
      const pickedUserInfo = await oidcAuthenticationService._getUserInfoFromEndpoint({ accessToken });

      // then
      expect(clientInstance.userinfo).to.have.been.calledOnceWithExactly(accessToken);
      expect(pickedUserInfo).to.deep.equal({
        sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
        family_name: 'familyName',
        given_name: 'givenName',
      });
    });

    context('when OpenId Client userinfo fails', function () {
      it('throws an error', async function () {
        const clientId = Symbol('clientId');
        const clientSecret = Symbol('clientSecret');
        const configKey = 'identityProviderConfigKey';
        const identityProvider = Symbol('identityProvider');
        const redirectUri = Symbol('redirectUri');
        const openidConfigurationUrl = Symbol('openidConfigurationUrl');

        sinon.stub(settings, 'identityProviderConfigKey').value({});

        const Client = sinon.stub().returns({ userinfo: sinon.stub().rejects(new Error('Fails to get user info')) });

        sinon.stub(Issuer, 'discover').resolves({ Client });

        const oidcAuthenticationService = new OidcAuthenticationService({
          clientId,
          clientSecret,
          configKey,
          identityProvider,
          redirectUri,
          openidConfigurationUrl,
        });
        await oidcAuthenticationService.createClient();

        // when
        const error = await catchErr(oidcAuthenticationService._getUserInfoFromEndpoint, oidcAuthenticationService)({});

        // then
        expect(error).to.be.instanceOf(OidcError);
        expect(error.message).to.be.equal('Fails to get user info');
      });
    });

    describe('when required properties are not returned by external API', function () {
      it('throws an error', async function () {
        // given
        const authenticationUrl = 'http://authenticationurl.net';
        const clientId = 'OIDC_CLIENT_ID';
        const clientSecret = 'OIDC_CLIENT_SECRET';
        const redirectUri = 'https://example.org/please-redirect-to-me';
        const organizationName = 'Example';

        sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');

        const oidcAuthenticationService = new OidcAuthenticationService({
          authenticationUrl,
          clientId,
          clientSecret,
          redirectUri,
          organizationName,
        });

        const clientInstance = {
          userinfo: sinon.stub().resolves({
            sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
            given_name: 'givenName',
            family_name: undefined,
          }),
        };
        const Client = sinon.stub().returns(clientInstance);

        sinon.stub(Issuer, 'discover').resolves({ Client });
        await oidcAuthenticationService.createClient();

        const accessToken = 'thisIsSerializedInformation';
        const errorMessage = `Un ou des champs obligatoires (family_name) n'ont pas été renvoyés par votre fournisseur d'identité Example.`;

        // when
        const error = await catchErr(
          oidcAuthenticationService._getUserInfoFromEndpoint,
          oidcAuthenticationService,
        )({
          accessToken,
        });

        // then
        expect(error).to.be.instanceOf(OidcMissingFieldsError);
        expect(error.message).to.be.equal(errorMessage);
        expect(error.code).to.be.equal(OIDC_ERRORS.USER_INFO.missingFields.code);
        expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWithExactly({
          message: errorMessage,
          missingFields: 'family_name',
          userInfo: {
            sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
            given_name: 'givenName',
            family_name: undefined,
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
      const userInfo = {};
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
        userInfo,
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

    context('when claimsToStore is empty', function () {
      it('does not store claimsToStore', async function () {
        // given
        const externalIdentityId = '1233BBBC';
        const user = new UserToCreate({
          firstName: 'Adam',
          lastName: 'Troisjours',
        });
        const userInfo = {};
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
        await oidcAuthenticationService.createUserAccount({
          externalIdentityId,
          user,
          userInfo,
          authenticationMethodRepository,
          userToCreateRepository,
        });

        // then
        expect(authenticationMethodRepository.create).to.have.been.calledWithExactly({
          authenticationMethod: expectedAuthenticationMethod,
          domainTransaction,
        });
      });
    });

    context('when claimsToStore is not empty', function () {
      it('stores claimsToStore', async function () {
        // given
        const externalIdentityId = '1233BBBC';
        const user = new UserToCreate({
          firstName: 'Adam',
          lastName: 'Troisjours',
        });
        const claimsToStore = ['employeeNumber', 'studentGroup'];
        const claimsToStoreWithValues = { employeeNumber: 'some-opaque-value', studentGroup: 'another-opaque-value' };
        const userInfo = { ...claimsToStoreWithValues };
        const userId = 1;
        userToCreateRepository.create.withArgs({ user, domainTransaction }).resolves({ id: userId });

        const identityProvider = OidcIdentityProviders.FWB.code;
        const expectedAuthenticationMethod = new AuthenticationMethod({
          identityProvider,
          authenticationComplement: new AuthenticationMethod.OidcAuthenticationComplement(claimsToStoreWithValues),
          externalIdentifier: externalIdentityId,
          userId,
        });
        const oidcAuthenticationService = new OidcAuthenticationService({ identityProvider, claimsToStore });

        // when
        await oidcAuthenticationService.createUserAccount({
          externalIdentityId,
          user,
          userInfo,
          authenticationMethodRepository,
          userToCreateRepository,
        });

        // then
        expect(authenticationMethodRepository.create).to.have.been.calledWithExactly({
          authenticationMethod: expectedAuthenticationMethod,
          domainTransaction,
        });
      });
    });
  });

  describe('#createClient', function () {
    it('creates an openid client', async function () {
      // given
      const clientId = Symbol('clientId');
      const clientSecret = Symbol('clientSecret');
      const configKey = 'identityProviderConfigKey';
      const identityProvider = Symbol('identityProvider');
      const redirectUri = Symbol('redirectUri');
      const openidConfigurationUrl = Symbol('openidConfigurationUrl');
      const Client = sinon.spy();

      sinon.stub(Issuer, 'discover').resolves({ Client });
      sinon.stub(settings, 'identityProviderConfigKey').value({});

      const oidcAuthenticationService = new OidcAuthenticationService({
        clientId,
        clientSecret,
        configKey,
        identityProvider,
        redirectUri,
        openidConfigurationUrl,
      });

      // when
      await oidcAuthenticationService.createClient();

      // then
      expect(Issuer.discover).to.have.been.calledWithExactly(openidConfigurationUrl);
      expect(Client).to.have.been.calledWithNew;
      expect(Client).to.have.been.calledWithExactly({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: [redirectUri],
      });
    });

    it('creates an openid client with extra meatadata', async function () {
      // given
      const clientId = Symbol('clientId');
      const clientSecret = Symbol('clientSecret');
      const configKey = 'identityProviderConfigKey';
      const identityProvider = Symbol('identityProvider');
      const redirectUri = Symbol('redirectUri');
      const openidConfigurationUrl = Symbol('openidConfigurationUrl');
      const openidClientExtraMetadata = { token_endpoint_auth_method: 'client_secret_post' };
      const Client = sinon.spy();

      sinon.stub(Issuer, 'discover').resolves({ Client });
      sinon.stub(settings, 'identityProviderConfigKey').value({});

      const oidcAuthenticationService = new OidcAuthenticationService({
        clientId,
        clientSecret,
        configKey,
        identityProvider,
        redirectUri,
        openidConfigurationUrl,
        openidClientExtraMetadata,
      });

      // when
      await oidcAuthenticationService.createClient();

      // then
      expect(Issuer.discover).to.have.been.calledWithExactly(openidConfigurationUrl);
      expect(Client).to.have.been.calledWithNew;
      expect(Client).to.have.been.calledWithExactly({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: [redirectUri],
        token_endpoint_auth_method: 'client_secret_post',
      });
    });
  });
});
