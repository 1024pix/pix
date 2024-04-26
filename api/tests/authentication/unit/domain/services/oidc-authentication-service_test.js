import jsonwebtoken from 'jsonwebtoken';
import ms from 'ms';
import { Issuer } from 'openid-client';

import { config as settings } from '../../../../../lib/config.js';
import { OIDC_ERRORS } from '../../../../../lib/domain/constants.js';
import * as OidcIdentityProviders from '../../../../../lib/domain/constants/oidc-identity-providers.js';
import { OidcMissingFieldsError } from '../../../../../lib/domain/errors.js';
import {
  AuthenticationMethod,
  AuthenticationSessionContent,
  UserToCreate,
} from '../../../../../lib/domain/models/index.js';
import { monitoringTools } from '../../../../../lib/infrastructure/monitoring-tools.js';
import { OidcAuthenticationService } from '../../../../../src/authentication/domain/services/oidc-authentication-service.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { OidcError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, catchErrSync, expect, sinon } from '../../../../test-helper.js';

const uuidV4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

describe('Unit | Domain | Services | oidc-authentication-service', function () {
  beforeEach(function () {
    sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');
  });

  describe('constructor', function () {
    context('when no parameter provided', function () {
      it('creates an instance with default values', function () {
        // given
        const args = {};

        // when
        const oidcAuthenticationService = new OidcAuthenticationService(args);

        // then
        expect(oidcAuthenticationService.shouldCloseSession).to.be.false;
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

    context('when claimsToStore is not empty', function () {
      it('sets claimsToStore', async function () {
        // given
        const args = { claimsToStore: 'employeeNumber,studentGroup' };

        // when
        const oidcAuthenticationService = new OidcAuthenticationService(args);

        // then
        expect(oidcAuthenticationService.claimsToStore).to.exist;
      });
    });
  });

  describe('#isReady', function () {
    describe('when enabled in config', function () {
      it('returns true', function () {
        // given
        const oidcAuthenticationService = new OidcAuthenticationService({
          clientId: 'anId',
          clientSecret: 'aSecret',
          additionalRequiredProperties: {
            aProperty: 'a property value',
          },
          enabled: true,
          openidConfigurationUrl: 'https://example.net/.well-known/openid-configuration',
          redirectUri: 'https://example.net/connexion/redirect',
        });

        // when
        const isOidcAuthenticationServiceReady = oidcAuthenticationService.isReady;

        // then
        expect(isOidcAuthenticationServiceReady).to.be.true;
      });
    });

    describe('when not enabled in config', function () {
      it('returns false', function () {
        // given
        const oidcAuthenticationService = new OidcAuthenticationService({});

        // when
        const result = oidcAuthenticationService.isReady;

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#createAccessToken', function () {
    it('creates access token with user id', function () {
      // given
      const userId = 42;
      const accessToken = Symbol('valid access token');
      const payload = { user_id: userId };
      const jwtOptions = { expiresIn: ms('48h') / 1000 };
      sinon
        .stub(jsonwebtoken, 'sign')
        .withArgs(payload, settings.authentication.secret, jwtOptions)
        .returns(accessToken);

      const oidcAuthenticationService = new OidcAuthenticationService(settings.oidcExampleNet);

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
        const claimsToStore = 'family_name,given_name';
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
    it('returns an idToken in the UUID v4 format', async function () {
      // given
      const idToken = 'some_dummy_id_token';
      const userId = 'some_dummy_user_id';
      const sessionTemporaryStorage = {
        save: sinon.stub().resolves(),
      };

      const oidcAuthenticationService = new OidcAuthenticationService(settings.oidcExampleNet, {
        sessionTemporaryStorage,
      });
      await oidcAuthenticationService.createClient();

      // when
      const result = await oidcAuthenticationService.saveIdToken({ idToken, userId });

      // then
      expect(result).to.match(uuidV4Regex);
    });
  });

  describe('#getRedirectLogoutUrl', function () {
    it('returns a redirect URL', async function () {
      // given
      const idToken = 'some_dummy_id_token';
      const userId = 'some_dummy_user_id';
      const logoutUrlUUID = 'some_dummy_logout_url_uuid';
      const sessionTemporaryStorage = {
        get: sinon.stub().resolves(idToken),
        delete: sinon.stub().resolves(),
      };
      const postLogoutRedirectUriEncoded = encodeURIComponent(settings.oidcExampleNet.postLogoutRedirectUri);
      const endSessionUrl = `https://example.net/logout?post_logout_redirect_uri=${postLogoutRedirectUriEncoded}&id_token_hint=some_dummy_id_token`;
      const clientInstance = { endSessionUrl: sinon.stub().resolves(endSessionUrl) };
      const Client = sinon.stub().returns(clientInstance);

      sinon.stub(Issuer, 'discover').resolves({ Client });

      const oidcAuthenticationService = new OidcAuthenticationService(settings.oidcExampleNet, {
        sessionTemporaryStorage,
      });
      await oidcAuthenticationService.createClient();

      // when
      const result = await oidcAuthenticationService.getRedirectLogoutUrl({ userId, logoutUrlUUID });

      // then
      expect(clientInstance.endSessionUrl).to.have.been.calledWith({
        id_token_hint: idToken,
        post_logout_redirect_uri: settings.oidcExampleNet.postLogoutRedirectUri,
      });
      expect(result).to.equal(
        'https://example.net/logout?post_logout_redirect_uri=https%3A%2F%2Fapp.dev.pix.local%2Fconnexion&id_token_hint=some_dummy_id_token',
      );
    });

    context('when OpenId Client endSessionUrl fails', function () {
      it('throws an error and logs a message in datadog', async function () {
        // given
        const idToken = 'some_dummy_id_token';
        const userId = 'some_dummy_user_id';
        const logoutUrlUUID = 'some_dummy_logout_url_uuid';
        const sessionTemporaryStorage = {
          get: sinon.stub().resolves(idToken),
          delete: sinon.stub().resolves(),
        };
        const errorThrown = new Error('Fails to generate endSessionUrl');

        const clientInstance = { endSessionUrl: sinon.stub().throws(errorThrown) };
        const Client = sinon.stub().returns(clientInstance);

        sinon.stub(Issuer, 'discover').resolves({ Client });

        const oidcAuthenticationService = new OidcAuthenticationService(settings.oidcExampleNet, {
          sessionTemporaryStorage,
        });
        await oidcAuthenticationService.createClient();

        // when
        const error = await catchErr(
          oidcAuthenticationService.getRedirectLogoutUrl,
          oidcAuthenticationService,
        )({ userId, logoutUrlUUID });

        // then
        expect(error).to.be.instanceOf(OidcError);
        expect(error.message).to.be.equal('Fails to generate endSessionUrl');
        expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWithExactly({
          context: 'oidc',
          data: { organizationName: 'Oidc Example' },
          error: { name: errorThrown.name },
          event: 'get-redirect-logout-url',
          message: errorThrown.message,
          team: 'acces',
        });
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
      it('throws an error and logs a message in datadog', async function () {
        const clientId = Symbol('clientId');
        const clientSecret = Symbol('clientSecret');
        const identityProvider = Symbol('identityProvider');
        const redirectUri = Symbol('redirectUri');
        const openidConfigurationUrl = Symbol('openidConfigurationUrl');
        const code = 'code';
        const nonce = 'nonce';
        const sessionState = 'sessionState';
        const state = 'state';
        const errorThrown = new Error('Fails to get tokens');

        errorThrown.error_uri = '/oauth2/token';
        errorThrown.response = 'api call response here';

        const clientInstance = { callback: sinon.stub().rejects(errorThrown) };
        const Client = sinon.stub().returns(clientInstance);

        sinon.stub(Issuer, 'discover').resolves({ Client });

        const oidcAuthenticationService = new OidcAuthenticationService({
          clientId,
          clientSecret,
          identityProvider,
          redirectUri,
          openidConfigurationUrl,
          organizationName: 'Oidc Example',
        });
        await oidcAuthenticationService.createClient();

        // when
        const error = await catchErr(
          oidcAuthenticationService.exchangeCodeForTokens,
          oidcAuthenticationService,
        )({ code, nonce, sessionState, state });

        // then
        expect(error).to.be.instanceOf(OidcError);
        expect(error.message).to.be.equal('Fails to get tokens');
        expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWithExactly({
          context: 'oidc',
          data: {
            code,
            nonce,
            organizationName: 'Oidc Example',
            sessionState,
            state,
          },
          error: {
            name: errorThrown.name,
            errorUri: '/oauth2/token',
            response: 'api call response here',
          },
          event: 'exchange-code-for-tokens',
          message: errorThrown.message,
          team: 'acces',
        });
      });
    });
  });

  describe('#getAuthorizationUrl', function () {
    it('returns oidc provider authentication url', async function () {
      // given
      const clientId = 'OIDC_CLIENT_ID';
      const clientSecret = 'OIDC_CLIENT_SECRET';
      const redirectUri = 'https://example.org/please-redirect-to-me';

      const oidcAuthenticationService = new OidcAuthenticationService({
        clientId,
        clientSecret,
        redirectUri,
      });

      const clientInstance = { authorizationUrl: sinon.stub().returns('') };
      const Client = sinon.stub().returns(clientInstance);

      sinon.stub(Issuer, 'discover').resolves({ Client });
      await oidcAuthenticationService.createClient();

      // when
      const { nonce, state } = oidcAuthenticationService.getAuthorizationUrl();

      // then
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
      it('throws an error and logs a message in datadog', async function () {
        // given
        const clientId = Symbol('clientId');
        const clientSecret = Symbol('clientSecret');
        const identityProvider = Symbol('identityProvider');
        const redirectUri = Symbol('redirectUri');
        const openidConfigurationUrl = Symbol('openidConfigurationUrl');
        const errorThrown = new Error('Fails to generate authorization url');

        const clientInstance = { authorizationUrl: sinon.stub().throws(errorThrown) };
        const Client = sinon.stub().returns(clientInstance);

        sinon.stub(Issuer, 'discover').resolves({ Client });

        const oidcAuthenticationService = new OidcAuthenticationService({
          clientId,
          clientSecret,
          identityProvider,
          redirectUri,
          openidConfigurationUrl,
          organizationName: 'Oidc Example',
        });
        await oidcAuthenticationService.createClient();

        // when
        const error = catchErrSync(oidcAuthenticationService.getAuthorizationUrl, oidcAuthenticationService)();

        // then
        expect(error).to.be.instanceOf(OidcError);
        expect(error.message).to.be.equal('Fails to generate authorization url');
        expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWithExactly({
          context: 'oidc',
          data: { organizationName: 'Oidc Example' },
          error: { name: errorThrown.name },
          event: 'generate-authorization-url',
          message: errorThrown.message,
          team: 'acces',
        });
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

    describe('when default required properties are not returned in id token', function () {
      it('calls userInfo endpoint', async function () {
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
          nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
          sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
        });

        const oidcAuthenticationService = new OidcAuthenticationService({});
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

    describe('when claimsToStore are not returned in id token', function () {
      it('calls userInfo endpoint', async function () {
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
          nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
          sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
          family_name: 'Le Gaulois',
          given_name: 'Astérix',
        });

        const oidcAuthenticationService = new OidcAuthenticationService({ claimsToStore: 'employeeNumber' });
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
      const clientId = 'OIDC_CLIENT_ID';
      const clientSecret = 'OIDC_CLIENT_SECRET';
      const redirectUri = 'https://example.org/please-redirect-to-me';

      const oidcAuthenticationService = new OidcAuthenticationService({
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
        given_name: 'givenName',
        family_name: 'familyName',
      });
    });

    context('when OpenId Client userinfo fails', function () {
      it('throws an error and logs a message in datadog', async function () {
        const clientId = Symbol('clientId');
        const clientSecret = Symbol('clientSecret');
        const identityProvider = Symbol('identityProvider');
        const redirectUri = Symbol('redirectUri');
        const openidConfigurationUrl = Symbol('openidConfigurationUrl');
        const errorThrown = new Error('Fails to get user info');

        const clientInstance = { userinfo: sinon.stub().rejects(errorThrown) };
        const Client = sinon.stub().returns(clientInstance);

        sinon.stub(Issuer, 'discover').resolves({ Client });

        const oidcAuthenticationService = new OidcAuthenticationService({
          clientId,
          clientSecret,
          identityProvider,
          redirectUri,
          openidConfigurationUrl,
          organizationName: 'Oidc Example',
        });
        await oidcAuthenticationService.createClient();

        // when
        const error = await catchErr(oidcAuthenticationService._getUserInfoFromEndpoint, oidcAuthenticationService)({});

        // then
        expect(error).to.be.instanceOf(OidcError);
        expect(error.message).to.be.equal('Fails to get user info');
        expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWithExactly({
          message: errorThrown.message,
          context: 'oidc',
          data: { organizationName: 'Oidc Example' },
          error: { name: errorThrown.name },
          event: 'get-user-info-from-endpoint',
          team: 'acces',
        });
      });
    });

    describe('when required properties are not returned by external API', function () {
      it('throws an error', async function () {
        // given
        const clientId = 'OIDC_CLIENT_ID';
        const clientSecret = 'OIDC_CLIENT_SECRET';
        const redirectUri = 'https://example.org/please-redirect-to-me';
        const organizationName = 'Example';

        const oidcAuthenticationService = new OidcAuthenticationService({
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
          context: 'oidc',
          data: {
            missingFields: 'family_name',
            userInfo: {
              sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
              given_name: 'givenName',
              family_name: undefined,
            },
          },
          event: 'find-missing-required-claims',
          message: errorMessage,
          team: 'acces',
        });
      });
    });
  });

  describe('#createUserAccount', function () {
    let userToCreateRepository, authenticationMethodRepository;
    let domainTransaction;

    beforeEach(function () {
      domainTransaction = Symbol();
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
        return lambda(domainTransaction);
      });

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
        const claimsToStore = 'employeeNumber,studentGroup';
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
      const identityProvider = Symbol('identityProvider');
      const redirectUri = Symbol('redirectUri');
      const openidConfigurationUrl = Symbol('openidConfigurationUrl');
      const Client = sinon.spy();

      sinon.stub(Issuer, 'discover').resolves({ Client });

      const oidcAuthenticationService = new OidcAuthenticationService({
        clientId,
        clientSecret,
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
      const identityProvider = Symbol('identityProvider');
      const redirectUri = Symbol('redirectUri');
      const openidConfigurationUrl = Symbol('openidConfigurationUrl');
      const openidClientExtraMetadata = { token_endpoint_auth_method: 'client_secret_post' };
      const Client = sinon.spy();

      sinon.stub(Issuer, 'discover').resolves({ Client });

      const oidcAuthenticationService = new OidcAuthenticationService({
        clientId,
        clientSecret,
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
