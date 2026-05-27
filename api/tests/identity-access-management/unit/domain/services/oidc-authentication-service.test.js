import jsonwebtoken from 'jsonwebtoken';
import ms from 'ms';
import sinon from 'sinon';

import { AuthenticationMethod } from '../../../../../src/identity-access-management/domain/models/AuthenticationMethod.js';
import { UserToCreate } from '../../../../../src/identity-access-management/domain/models/UserToCreate.js';
import { OidcAuthenticationService } from '../../../../../src/identity-access-management/domain/services/oidc-authentication-service.js';
import { config as settings } from '../../../../../src/shared/config.js';
import { OIDC_ERRORS } from '../../../../../src/shared/domain/constants.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { OidcError, OidcMissingFieldsError } from '../../../../../src/shared/domain/errors.js';
import { AuthenticationSessionContent } from '../../../../../src/shared/domain/models/AuthenticationSessionContent.js';
import { logger } from '../../../../../src/shared/infrastructure/utils/logger.js';
import { expect } from '../../../../test-helper.js';
import { createOpenIdClientMock } from '../../../../tooling/mocks/openid-client.mock.js';
import { catchErr, catchErrSync } from '../../../../tooling/test-utils/error.js';

const uuidV4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const MOCK_OIDC_PROVIDER_CONFIG = Symbol('config');

describe('Unit | Domain | Services | oidc-authentication-service', function () {
  let openidClient;
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ toFake: ['Date'] });
    sinon.stub(logger, 'error');

    openidClient = createOpenIdClientMock(MOCK_OIDC_PROVIDER_CONFIG);
  });

  afterEach(function () {
    clock.restore();
  });

  describe('constructor', function () {
    context('when no parameter provided', function () {
      it('creates an instance with default values', function () {
        // given
        const args = {};

        // when
        const oidcAuthenticationService = new OidcAuthenticationService(args, { openidClient });

        // then
        expect(oidcAuthenticationService.shouldCloseSession).to.be.false;
        expect(oidcAuthenticationService.scope).to.equal('openid profile');
        expect(oidcAuthenticationService.isVisible).to.equal(true);
      });
    });

    context('when claimMapping and claimsToStore are null', function () {
      it('creates a default claimManager ', async function () {
        // given
        const args = { claimMapping: null, claimsToStore: null };

        // when
        const { claimManager } = new OidcAuthenticationService(args, { openidClient });
        const claims = claimManager.getMissingMandatoryClaims();

        // then
        expect(claims).to.deep.equal(['given_name', 'family_name', 'sub']);
      });
    });

    context('when claimMapping is defined', function () {
      it('creates a claimManager with the given claimsToStore', async function () {
        // given
        const args = { claimMapping: { firstName: ['hello'] }, claimsToStore: null };

        // when
        const { claimManager } = new OidcAuthenticationService(args, { openidClient });
        const claims = claimManager.getMissingMandatoryClaims();

        // then
        expect(claims).to.deep.equal(['hello']);
      });
    });

    context('when claimMapping and claimsToStore are defined', function () {
      it('creates a claimManager with the given claimMapping and claimsToStore', async function () {
        // given
        const args = { claimMapping: { firstName: ['hello'] }, claimsToStore: 'employeeNumber,studentGroup' };

        // when
        const { claimManager } = new OidcAuthenticationService(args, { openidClient });
        const claims = claimManager.getMissingMandatoryClaims();

        // then
        expect(claims).to.deep.equal(['hello']);
      });
    });
  });

  describe('#isReady', function () {
    context('when enabled in config', function () {
      it('returns true', function () {
        // given
        const oidcAuthenticationService = new OidcAuthenticationService(
          {
            clientId: 'anId',
            clientSecret: 'aSecret',
            additionalRequiredProperties: {
              aProperty: 'a property value',
            },
            enabled: true,
            openidConfigurationUrl: 'https://example.net/.well-known/openid-configuration',
            redirectUri: 'https://example.net/connexion/redirect',
          },
          { openidClient },
        );

        // when
        const isOidcAuthenticationServiceReady = oidcAuthenticationService.isReady;

        // then
        expect(isOidcAuthenticationServiceReady).to.be.true;
      });
    });

    context('when not enabled in config', function () {
      it('returns false', function () {
        // given
        const oidcAuthenticationService = new OidcAuthenticationService({}, { openidClient });

        // when
        const result = oidcAuthenticationService.isReady;

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#createAccessToken', function () {
    it('creates access token with user id and audience', function () {
      // given
      const userId = 42;
      const accessToken = Symbol('valid access token');
      const audience = 'https://admin.pix.fr';
      const payload = { user_id: userId, aud: audience };
      const jwtOptions = { expiresIn: ms('48h') / 1000 };
      sinon
        .stub(jsonwebtoken, 'sign')
        .withArgs(payload, settings.authentication.secret, jwtOptions)
        .returns(accessToken);

      const oidcAuthenticationService = new OidcAuthenticationService(settings.oidcExampleNet, { openidClient });

      // when
      const result = oidcAuthenticationService.createAccessToken({ userId, audience });

      // then
      expect(result).to.equal(accessToken);
    });
  });

  describe('#createAuthenticationComplement', function () {
    context('when claimsToStore is empty', function () {
      it('returns undefined', function () {
        // given
        const userInfo = {};
        const identityProvider = 'genericOidcProviderCode';
        const oidcAuthenticationService = new OidcAuthenticationService({ identityProvider }, { openidClient });

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
        const identityProvider = 'genericOidcProviderCode';
        const oidcAuthenticationService = new OidcAuthenticationService(
          { identityProvider, claimsToStore },
          { openidClient },
        );

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
        openidClient,
      });
      await oidcAuthenticationService.initializeClientConfig();

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
      openidClient.buildEndSessionUrl.resolves(endSessionUrl);

      const oidcAuthenticationService = new OidcAuthenticationService(settings.oidcExampleNet, {
        sessionTemporaryStorage,
        openidClient,
      });
      await oidcAuthenticationService.initializeClientConfig();

      // when
      const result = await oidcAuthenticationService.getRedirectLogoutUrl({ userId, logoutUrlUUID });

      // then
      expect(openidClient.buildEndSessionUrl).to.have.been.calledWith(MOCK_OIDC_PROVIDER_CONFIG, {
        id_token_hint: idToken,
        post_logout_redirect_uri: settings.oidcExampleNet.postLogoutRedirectUri,
      });
      expect(result).to.equal(
        'https://example.net/logout?post_logout_redirect_uri=https%3A%2F%2Fapp.dev.pix.local%2Fconnexion&id_token_hint=some_dummy_id_token',
      );
    });

    context('when openidClient endSessionUrl fails', function () {
      it('throws an error and logs monitoring data', async function () {
        // given
        const idToken = 'some_dummy_id_token';
        const userId = 'some_dummy_user_id';
        const logoutUrlUUID = 'some_dummy_logout_url_uuid';
        const sessionTemporaryStorage = {
          get: sinon.stub().resolves(idToken),
          delete: sinon.stub().resolves(),
        };

        const errorThrown = new Error('A low-level server error with potential information');
        openidClient.buildEndSessionUrl.callsFake(() => {
          clock.tick(2000);
          throw errorThrown;
        });

        const oidcAuthenticationService = new OidcAuthenticationService(settings.oidcExampleNet, {
          sessionTemporaryStorage,
          openidClient,
        });
        await oidcAuthenticationService.initializeClientConfig();

        // when
        const error = await catchErr(
          oidcAuthenticationService.getRedirectLogoutUrl,
          oidcAuthenticationService,
        )({ userId, logoutUrlUUID });

        // then
        expect(error).to.be.instanceOf(OidcError);
        expect(error.message).to.be.equal('Error during getRedirectLogoutUrl');
        expect(logger.error).to.have.been.calledWithExactly({
          context: 'oidc',
          data: { organizationName: 'Oidc Example' },
          error: {
            name: errorThrown.name,
            message: errorThrown.message,
            stack: sinon.match.string,
          },
          event: 'get-redirect-logout-url',
          message: errorThrown.message,
          team: 'acces',
          duration: sinon.match.number.and(
            sinon.match((val) => {
              return val >= 2000;
            }),
          ),
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
      const code = 'AUTHORIZATION_CODE';
      const state = 'STATE';
      const nonce = 'NONCE';
      const oidcAuthenticationSessionContent = new AuthenticationSessionContent({
        idToken,
        accessToken,
        expiresIn,
        refreshToken,
      });
      openidClient.authorizationCodeGrant.resolves({
        access_token: accessToken,
        expires_in: expiresIn,
        id_token: idToken,
        refresh_token: refreshToken,
      });

      const oidcAuthenticationService = new OidcAuthenticationService(
        {
          clientSecret,
          clientId,
          redirectUri,
          openidConfigurationUrl,
          tokenUrl,
        },
        { openidClient },
      );
      await oidcAuthenticationService.initializeClientConfig();

      // when
      const result = await oidcAuthenticationService.exchangeCodeForTokens({ code, nonce, state });

      // then
      expect(result).to.be.an.instanceOf(AuthenticationSessionContent);
      expect(result).to.deep.equal(oidcAuthenticationSessionContent);
    });

    context('when openidClient callback fails', function () {
      it('throws an error and logs monitoring data', async function () {
        const clientId = 'clientId';
        const clientSecret = 'clientSecret';
        const identityProvider = 'identityProvider';
        const redirectUri = 'https://example.org/please-redirect-to-me';
        const openidConfigurationUrl = 'https://example.org/oidc-provider-configuration';
        const code = 'code';
        const nonce = 'nonce';
        const iss = 'https://issuer.url';
        const sessionState = 'sessionState';
        const state = 'state';

        const errorThrown = new Error('A low-level server error with potential information', {
          cause: new Error('An optional cause'),
        });
        errorThrown.error_uri = '/oauth2/token';
        errorThrown.response = 'api call response here';
        openidClient.authorizationCodeGrant.callsFake(() => {
          clock.tick(2000);
          throw errorThrown;
        });

        const oidcAuthenticationService = new OidcAuthenticationService(
          {
            clientId,
            clientSecret,
            identityProvider,
            redirectUri,
            openidConfigurationUrl,
            organizationName: 'Oidc Example',
          },
          { openidClient },
        );
        await oidcAuthenticationService.initializeClientConfig();

        // when
        const error = await catchErr(
          oidcAuthenticationService.exchangeCodeForTokens,
          oidcAuthenticationService,
        )({ code, state, iss, nonce, sessionState });

        // then
        expect(error).to.be.instanceOf(OidcError);
        expect(error.message).to.be.equal('Error during exchangeCodeForTokens');
        expect(logger.error).to.have.been.calledWithExactly({
          context: 'oidc',
          data: {
            code,
            state,
            iss,
            nonce,
            organizationName: 'Oidc Example',
            sessionState,
          },
          error: {
            name: errorThrown.name,
            message: errorThrown.message,
            stack: sinon.match.string,
            cause: sinon.match.any,
            causeStack: sinon.match.any,
            errorUri: '/oauth2/token',
            response: 'api call response here',
          },
          event: 'exchange-code-for-tokens',
          message: errorThrown.message,
          team: 'acces',
          duration: sinon.match.number.and(
            sinon.match((val) => {
              return val >= 2000;
            }),
          ),
        });
      });
    });
  });

  describe('#getAuthorizationUrl', function () {
    it('returns oidc provider authentication url', async function () {
      // given
      const clientId = 'OIDC_CLIENT_ID';
      const clientSecret = 'OIDC_CLIENT_SECRET';
      const identityProvider = 'identityProvider';
      const redirectUri = 'https://example.org/please-redirect-to-me';
      const openidConfigurationUrl = 'https://example.org/oidc-provider-configuration';

      openidClient.buildAuthorizationUrl.returns('');

      const oidcAuthenticationService = new OidcAuthenticationService(
        {
          clientId,
          clientSecret,
          identityProvider,
          redirectUri,
          openidConfigurationUrl,
          organizationName: 'Oidc Example',
        },
        { openidClient },
      );

      await oidcAuthenticationService.initializeClientConfig();

      // when
      const { nonce, state } = oidcAuthenticationService.getAuthorizationUrl();

      // then
      expect(nonce).to.match(uuidV4Regex);
      expect(state).to.match(uuidV4Regex);

      expect(openidClient.buildAuthorizationUrl).to.have.been.calledWithExactly(MOCK_OIDC_PROVIDER_CONFIG, {
        nonce,
        redirect_uri: 'https://example.org/please-redirect-to-me',
        scope: 'openid profile',
        state,
      });
    });

    context('when generating the authorization url fails', function () {
      it('throws an error and logs monitoring data', async function () {
        // given
        const clientId = 'clientId';
        const clientSecret = 'clientSecret';
        const identityProvider = 'identityProvider';
        const redirectUri = 'https://example.org/please-redirect-to-me';
        const openidConfigurationUrl = 'https://example.org/oidc-provider-configuration';

        const errorThrown = new Error('A low-level server error with potential information');
        openidClient.buildAuthorizationUrl.callsFake(() => {
          clock.tick(2000);
          throw errorThrown;
        });

        const oidcAuthenticationService = new OidcAuthenticationService(
          {
            clientId,
            clientSecret,
            identityProvider,
            redirectUri,
            openidConfigurationUrl,
            organizationName: 'Oidc Example',
          },
          { openidClient },
        );
        await oidcAuthenticationService.initializeClientConfig();

        // when
        const error = catchErrSync(oidcAuthenticationService.getAuthorizationUrl, oidcAuthenticationService)();

        // then
        expect(error).to.be.instanceOf(OidcError);
        expect(error.message).to.be.equal('Error during getAuthorizationUrl');
        expect(logger.error).to.have.been.calledWithExactly({
          context: 'oidc',
          data: { organizationName: 'Oidc Example' },
          error: {
            name: errorThrown.name,
            message: errorThrown.message,
            stack: sinon.match.string,
          },
          event: 'generate-authorization-url',
          message: errorThrown.message,
          team: 'acces',
          duration: sinon.match.number.and(
            sinon.match((val) => {
              return val >= 2000;
            }),
          ),
        });
      });
    });
  });

  describe('#getUserInfo', function () {
    it('returns firstName, lastName and external identity id', async function () {
      // given
      const idToken = jsonwebtoken.sign(
        {
          given_name: 'givenName',
          family_name: 'familyName',
          nonce: 'nonce-id',
          sub: 'sub-id',
        },
        'secret',
      );

      const oidcAuthenticationService = new OidcAuthenticationService({}, { openidClient });

      // when
      const result = await oidcAuthenticationService.getUserInfo({
        idToken,
        accessToken: 'accessToken',
      });

      // then
      expect(result).to.deep.equal({
        firstName: 'givenName',
        lastName: 'familyName',
        externalIdentityId: 'sub-id',
      });
    });

    context('when claimsToStore is defined', function () {
      it('returns firstName, lastName, external identity id and claims to store', async function () {
        // given
        const idToken = jsonwebtoken.sign(
          {
            given_name: 'givenName',
            family_name: 'familyName',
            nonce: 'nonce-id',
            sub: 'sub-id',
            employeeNumber: '12345',
          },
          'secret',
        );

        const oidcAuthenticationService = new OidcAuthenticationService(
          { claimsToStore: 'employeeNumber' },
          { openidClient },
        );

        // when
        const result = await oidcAuthenticationService.getUserInfo({
          idToken,
          accessToken: 'accessToken',
        });

        // then
        expect(result).to.deep.equal({
          firstName: 'givenName',
          lastName: 'familyName',
          externalIdentityId: 'sub-id',
          employeeNumber: '12345',
        });
      });
    });

    context('when claimMapping is defined', function () {
      it('returns mapped firstName, lastName, external identity id', async function () {
        // given
        const idToken = jsonwebtoken.sign(
          {
            given_name: 'givenName',
            usual_name: 'familyName',
            nonce: 'nonce-id',
            sub: 'sub-id',
          },
          'secret',
        );

        const claimMapping = {
          firstName: ['given_name'],
          lastName: ['usual_name'],
          externalIdentityId: ['sub'],
        };
        const oidcAuthenticationService = new OidcAuthenticationService({ claimMapping }, { openidClient });

        // when
        const result = await oidcAuthenticationService.getUserInfo({
          idToken,
          accessToken: 'accessToken',
        });

        // then
        expect(result).to.deep.equal({
          firstName: 'givenName',
          lastName: 'familyName',
          externalIdentityId: 'sub-id',
        });
      });
    });

    context('when claimMapping and claimsToStore are defined', function () {
      it('returns mapped firstName, lastName, external identity id and claims to store', async function () {
        // given
        const idToken = jsonwebtoken.sign(
          {
            given_name: 'givenName',
            usual_name: 'familyName',
            nonce: 'nonce-id',
            sub: 'sub-id',
            employeeNumber: '12345',
          },
          'secret',
        );

        const claimMapping = {
          firstName: ['given_name'],
          lastName: ['usual_name'],
          externalIdentityId: ['sub'],
        };
        const oidcAuthenticationService = new OidcAuthenticationService(
          { claimMapping, claimsToStore: 'employeeNumber' },
          { openidClient },
        );

        // when
        const result = await oidcAuthenticationService.getUserInfo({
          idToken,
          accessToken: 'accessToken',
        });

        // then
        expect(result).to.deep.equal({
          firstName: 'givenName',
          lastName: 'familyName',
          externalIdentityId: 'sub-id',
          employeeNumber: '12345',
        });
      });
    });

    context('when default required properties are not returned in id token', function () {
      it('calls userInfo endpoint', async function () {
        // given
        const idToken = jsonwebtoken.sign(
          {
            nonce: 'nonce-id',
            sub: 'sub-id',
          },
          'secret',
        );

        const oidcAuthenticationService = new OidcAuthenticationService({}, { openidClient });
        sinon.stub(oidcAuthenticationService, '_getUserInfoFromEndpoint').resolves({});

        // when
        await oidcAuthenticationService.getUserInfo({ idToken, accessToken: 'accessToken' });

        // then
        expect(oidcAuthenticationService._getUserInfoFromEndpoint).to.have.been.calledOnceWithExactly({
          accessToken: 'accessToken',
          expectedSubject: 'sub-id',
        });
      });
    });

    context('when claimsToStore are not returned in id token', function () {
      it('calls userInfo endpoint', async function () {
        // given
        const idToken = jsonwebtoken.sign(
          {
            nonce: 'nonce-id',
            sub: 'sub-id',
            family_name: 'Le Gaulois',
            given_name: 'Astérix',
          },
          'secret',
        );

        const oidcAuthenticationService = new OidcAuthenticationService(
          { claimsToStore: 'employeeNumber' },
          { openidClient },
        );
        sinon.stub(oidcAuthenticationService, '_getUserInfoFromEndpoint').resolves({});

        // when
        await oidcAuthenticationService.getUserInfo({
          idToken,
          accessToken: 'accessToken',
        });

        // then
        expect(oidcAuthenticationService._getUserInfoFromEndpoint).to.have.been.calledOnceWithExactly({
          accessToken: 'accessToken',
          expectedSubject: 'sub-id',
        });
      });
    });
  });

  describe('#_getUserInfoFromEndpoint', function () {
    it('returns firstName, lastName and external identity id', async function () {
      // given
      const clientId = 'OIDC_CLIENT_ID';
      const clientSecret = 'OIDC_CLIENT_SECRET';
      const identityProvider = 'identityProvider';
      const redirectUri = 'https://example.org/please-redirect-to-me';
      const openidConfigurationUrl = 'https://example.org/oidc-provider-configuration';

      openidClient.fetchUserInfo.returns({
        sub: 'sub-id',
        given_name: 'givenName',
        family_name: 'familyName',
      });

      const oidcAuthenticationService = new OidcAuthenticationService(
        {
          clientId,
          clientSecret,
          identityProvider,
          redirectUri,
          openidConfigurationUrl,
          organizationName: 'Oidc Example',
        },
        { openidClient },
      );

      await oidcAuthenticationService.initializeClientConfig();

      const accessToken = 'thisIsSerializedInformation';

      // when
      const pickedUserInfo = await oidcAuthenticationService._getUserInfoFromEndpoint({
        accessToken,
        expectedSubject: 'sub-id',
      });

      // then
      expect(openidClient.fetchUserInfo).to.have.been.calledOnceWithExactly(
        MOCK_OIDC_PROVIDER_CONFIG,
        accessToken,
        'sub-id',
      );
      expect(pickedUserInfo).to.deep.equal({
        sub: 'sub-id',
        given_name: 'givenName',
        family_name: 'familyName',
      });
    });

    context('when openidClient userinfo fails', function () {
      it('throws an error and logs monitoring data', async function () {
        const clientId = 'OIDC_CLIENT_ID';
        const clientSecret = 'OIDC_CLIENT_SECRET';
        const identityProvider = 'identityProvider';
        const redirectUri = 'https://example.org/please-redirect-to-me';
        const openidConfigurationUrl = 'https://example.org/oidc-provider-configuration';

        const errorThrown = new Error('A low-level server error with potential information');
        openidClient.fetchUserInfo.callsFake(() => {
          clock.tick(2000);
          throw errorThrown;
        });

        const oidcAuthenticationService = new OidcAuthenticationService(
          {
            clientId,
            clientSecret,
            identityProvider,
            redirectUri,
            openidConfigurationUrl,
            organizationName: 'Oidc Example',
          },
          { openidClient },
        );
        await oidcAuthenticationService.initializeClientConfig();

        // when
        const error = await catchErr(oidcAuthenticationService._getUserInfoFromEndpoint, oidcAuthenticationService)({});

        // then
        expect(error).to.be.instanceOf(OidcError);
        expect(error.message).to.be.equal('Error during _getUserInfoFromEndpoint');
        expect(logger.error).to.have.been.calledWithExactly({
          message: errorThrown.message,
          context: 'oidc',
          data: { organizationName: 'Oidc Example' },
          error: {
            name: errorThrown.name,
            message: errorThrown.message,
            stack: sinon.match.string,
          },
          event: 'get-user-info-from-endpoint',
          team: 'acces',
          duration: sinon.match.number.and(
            sinon.match((val) => {
              return val >= 2000;
            }),
          ),
        });
      });
    });

    context('when required properties are not returned by external API', function () {
      it('throws an error', async function () {
        // given
        const clientId = 'OIDC_CLIENT_ID';
        const clientSecret = 'OIDC_CLIENT_SECRET';
        const identityProvider = 'identityProvider';
        const redirectUri = 'https://example.org/please-redirect-to-me';
        const openidConfigurationUrl = 'https://example.org/oidc-provider-configuration';

        openidClient.fetchUserInfo.returns({
          sub: 'sub-id',
          given_name: 'givenName',
          family_name: undefined,
        });

        const oidcAuthenticationService = new OidcAuthenticationService(
          {
            clientId,
            clientSecret,
            identityProvider,
            redirectUri,
            openidConfigurationUrl,
            organizationName: 'Oidc Example',
          },
          { openidClient },
        );

        await oidcAuthenticationService.initializeClientConfig();

        const accessToken = 'thisIsSerializedInformation';

        // when
        const error = await catchErr(
          oidcAuthenticationService._getUserInfoFromEndpoint,
          oidcAuthenticationService,
        )({ accessToken, expectedSubject: 'sub-id' });

        // then
        expect(error).to.be.instanceOf(OidcMissingFieldsError);
        expect(error.message).to.be.equal(
          'Le ou les champs obligatoires suivants n’ont pas été renvoyés par le fournisseur d’identité Oidc Example : family_name',
        );
        expect(error.code).to.be.equal(OIDC_ERRORS.USER_INFO.missingFields.code);
        expect(logger.error).to.have.been.calledWithExactly({
          context: 'oidc',
          data: {
            missingFields: 'family_name',
            userInfo: {
              sub: 'sub-id',
              given_name: 'givenName',
              family_name: undefined,
            },
            organizationName: 'Oidc Example',
          },
          event: 'missing-required-claims',
          message: 'Missing required claims',
          team: 'acces',
        });
      });
    });

    context('when a additional claim is returned empty by the UserInfo endpoint', function () {
      it('returns user info', async function () {
        // given
        const clientId = 'OIDC_CLIENT_ID';
        const clientSecret = 'OIDC_CLIENT_SECRET';
        const identityProvider = 'identityProvider';
        const redirectUri = 'https://example.org/please-redirect-to-me';
        const openidConfigurationUrl = 'https://example.org/oidc-provider-configuration';

        openidClient.fetchUserInfo.returns({
          sub: 'sub-id',
          given_name: 'givenName',
          family_name: 'familyName',
          population: '',
        });

        const oidcAuthenticationService = new OidcAuthenticationService(
          {
            claimsToStore: 'population',
            clientId,
            clientSecret,
            identityProvider,
            redirectUri,
            openidConfigurationUrl,
            organizationName: 'Oidc Example',
          },
          { openidClient },
        );
        await oidcAuthenticationService.initializeClientConfig();

        const accessToken = 'thisIsSerializedInformation';

        // when
        const pickedUserInfo = await oidcAuthenticationService._getUserInfoFromEndpoint({
          accessToken,
          expectedSubject: 'sub-id',
        });

        // then
        expect(pickedUserInfo).to.deep.equal({
          sub: 'sub-id',
          given_name: 'givenName',
          family_name: 'familyName',
          population: '',
        });
      });
    });
  });

  describe('#createUserAccount', function () {
    let userToCreateRepository, authenticationMethodRepository;

    beforeEach(function () {
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
        return lambda();
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
      userToCreateRepository.create.withArgs({ user }).resolves({ id: userId });

      const identityProvider = 'genericOidcProviderCode';
      const expectedAuthenticationMethod = new AuthenticationMethod({
        identityProvider,
        externalIdentifier: externalIdentityId,
        userId,
      });
      const oidcAuthenticationService = new OidcAuthenticationService({ identityProvider }, { openidClient });

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
      });
      expect(result).to.equal(userId);
    });

    context('when there is a connectionMethodCode', function () {
      it('creates an authentication method with connectionMethodCode as value for identityProvider', async function () {
        // given
        const externalIdentityId = '1233BBBC';

        const user = new UserToCreate({
          firstName: 'Adam',
          lastName: 'Troisjours',
        });
        const userInfo = {};
        const userId = 1;
        userToCreateRepository.create.withArgs({ user }).resolves({ id: userId });

        const identityProvider = 'genericOidcProviderCode';
        const connectionMethodCode = 'aliasForGenericOidcProviderCode';

        const oidcAuthenticationService = new OidcAuthenticationService(
          { identityProvider, connectionMethodCode },
          { openidClient },
        );
        const expectedAuthenticationMethod = new AuthenticationMethod({
          identityProvider: connectionMethodCode,
          externalIdentifier: externalIdentityId,
          userId,
        });

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
        });
      });
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
        userToCreateRepository.create.withArgs({ user }).resolves({ id: userId });

        const identityProvider = 'genericOidcProviderCode';
        const expectedAuthenticationMethod = new AuthenticationMethod({
          identityProvider,
          externalIdentifier: externalIdentityId,
          userId,
        });
        const oidcAuthenticationService = new OidcAuthenticationService({ identityProvider }, { openidClient });

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
        userToCreateRepository.create.withArgs({ user }).resolves({ id: userId });

        const identityProvider = 'genericOidcProviderCode';
        const expectedAuthenticationMethod = new AuthenticationMethod({
          identityProvider,
          authenticationComplement: new AuthenticationMethod.OidcAuthenticationComplement(claimsToStoreWithValues),
          externalIdentifier: externalIdentityId,
          userId,
        });
        const oidcAuthenticationService = new OidcAuthenticationService(
          { identityProvider, claimsToStore },
          { openidClient },
        );

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
        });
      });
    });
  });

  describe('#initializeClientConfig', function () {
    it('creates an openidClient', async function () {
      // given
      const clientId = 'clientId';
      const clientSecret = 'clientSecret';
      const identityProvider = 'identityProvider';
      const redirectUri = 'https://example.org/please-redirect-to-me';
      const openidConfigurationUrl = 'https://example.org/oidc-provider-configuration';

      const oidcAuthenticationService = new OidcAuthenticationService(
        {
          clientId,
          clientSecret,
          identityProvider,
          redirectUri,
          openidConfigurationUrl,
        },
        { openidClient },
      );

      // when
      await oidcAuthenticationService.initializeClientConfig();

      // then
      expect(openidClient.discovery).to.have.been.calledWithExactly(new URL(openidConfigurationUrl), clientId, {
        client_secret: clientSecret,
      });
    });

    it('creates an openidClient with extra metadata', async function () {
      // given
      const clientId = 'clientId';
      const clientSecret = 'clientSecret';
      const identityProvider = 'identityProvider';
      const redirectUri = 'https://example.org/please-redirect-to-me';
      const openidConfigurationUrl = 'https://example.org/oidc-provider-configuration';
      const openidClientExtraMetadata = { token_endpoint_auth_method: 'client_secret_post' };

      const oidcAuthenticationService = new OidcAuthenticationService(
        {
          clientId,
          clientSecret,
          identityProvider,
          redirectUri,
          openidConfigurationUrl,
          openidClientExtraMetadata,
        },
        { openidClient },
      );

      // when
      await oidcAuthenticationService.initializeClientConfig();

      // then
      expect(openidClient.discovery).to.have.been.calledWithExactly(new URL(openidConfigurationUrl), clientId, {
        client_secret: clientSecret,
        token_endpoint_auth_method: 'client_secret_post',
      });
    });
  });
});
