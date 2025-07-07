import jsonwebtoken from 'jsonwebtoken';
import ms from 'ms';

import { OidcAuthenticationService } from '../../../../../src/identity-access-management/domain/services/oidc-authentication-service.js';
import { config as settings } from '../../../../../src/shared/config.js';
import { OIDC_ERRORS } from '../../../../../src/shared/domain/constants.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { OidcError, OidcMissingFieldsError } from '../../../../../src/shared/domain/errors.js';
import {
  AuthenticationMethod,
  AuthenticationSessionContent,
  UserToCreate,
} from '../../../../../src/shared/domain/models/index.js';
import { logger } from '../../../../../src/shared/infrastructure/utils/logger.js';
import { catchErr, catchErrSync, expect, sinon } from '../../../../test-helper.js';
import { createOpenIdClientMock } from '../../../../tooling/openid-client/openid-client-mocks.js';

const uuidV4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const MOCK_OIDC_PROVIDER_CONFIG = Symbol('config');

describe('Unit | Domain | Services | oidc-authentication-service', function () {
  let openIdClient;

  beforeEach(function () {
    openIdClient = createOpenIdClientMock(MOCK_OIDC_PROVIDER_CONFIG);
    sinon.stub(logger, 'error');
  });

  describe('constructor', function () {
    context('when no parameter provided', function () {
      it('creates an instance with default values', function () {
        // given
        const args = {};

        // when
        const oidcAuthenticationService = new OidcAuthenticationService(args, { openIdClient });

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
        const { claimManager } = new OidcAuthenticationService(args, { openIdClient });
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
        const { claimManager } = new OidcAuthenticationService(args, { openIdClient });
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
        const { claimManager } = new OidcAuthenticationService(args, { openIdClient });
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
          { openIdClient },
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
        const oidcAuthenticationService = new OidcAuthenticationService({}, { openIdClient });

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

      const oidcAuthenticationService = new OidcAuthenticationService(settings.oidcExampleNet, { openIdClient });

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
        const oidcAuthenticationService = new OidcAuthenticationService({ identityProvider }, { openIdClient });

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
          { openIdClient },
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
        openIdClient,
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
      openIdClient.buildEndSessionUrl.resolves(endSessionUrl);

      const oidcAuthenticationService = new OidcAuthenticationService(settings.oidcExampleNet, {
        sessionTemporaryStorage,
        openIdClient,
      });
      await oidcAuthenticationService.initializeClientConfig();

      // when
      const result = await oidcAuthenticationService.getRedirectLogoutUrl({ userId, logoutUrlUUID });

      // then
      expect(openIdClient.buildEndSessionUrl).to.have.been.calledWith(MOCK_OIDC_PROVIDER_CONFIG, {
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
        openIdClient.buildEndSessionUrl.throws(errorThrown);

        const oidcAuthenticationService = new OidcAuthenticationService(settings.oidcExampleNet, {
          sessionTemporaryStorage,
          openIdClient,
        });
        await oidcAuthenticationService.initializeClientConfig();

        // when
        const error = await catchErr(
          oidcAuthenticationService.getRedirectLogoutUrl,
          oidcAuthenticationService,
        )({ userId, logoutUrlUUID });

        // then
        expect(error).to.be.instanceOf(OidcError);
        expect(error.message).to.be.equal('Fails to generate endSessionUrl');
        expect(logger.error).to.have.been.calledWithExactly({
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
      const code = 'AUTHORIZATION_CODE';
      const state = 'STATE';
      const nonce = 'NONCE';
      const oidcAuthenticationSessionContent = new AuthenticationSessionContent({
        idToken,
        accessToken,
        expiresIn,
        refreshToken,
      });
      openIdClient.authorizationCodeGrant.resolves({
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
        { openIdClient },
      );
      await oidcAuthenticationService.initializeClientConfig();

      // when
      const result = await oidcAuthenticationService.exchangeCodeForTokens({ code, nonce, state });

      // then
      expect(result).to.be.an.instanceOf(AuthenticationSessionContent);
      expect(result).to.deep.equal(oidcAuthenticationSessionContent);
    });

    context('when OpenId Client callback fails', function () {
      it('throws an error and logs a message in datadog', async function () {
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
        const errorThrown = new Error('Fails to get tokens');

        errorThrown.error_uri = '/oauth2/token';
        errorThrown.response = 'api call response here';

        openIdClient.authorizationCodeGrant.rejects(errorThrown);

        const oidcAuthenticationService = new OidcAuthenticationService(
          {
            clientId,
            clientSecret,
            identityProvider,
            redirectUri,
            openidConfigurationUrl,
            organizationName: 'Oidc Example',
          },
          { openIdClient },
        );
        await oidcAuthenticationService.initializeClientConfig();

        // when
        const error = await catchErr(
          oidcAuthenticationService.exchangeCodeForTokens,
          oidcAuthenticationService,
        )({ code, state, iss, nonce, sessionState });

        // then
        expect(error).to.be.instanceOf(OidcError);
        expect(error.message).to.be.equal('Fails to get tokens');
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
      const identityProvider = 'identityProvider';
      const redirectUri = 'https://example.org/please-redirect-to-me';
      const openidConfigurationUrl = 'https://example.org/oidc-provider-configuration';

      openIdClient.buildAuthorizationUrl.returns('');

      const oidcAuthenticationService = new OidcAuthenticationService(
        {
          clientId,
          clientSecret,
          identityProvider,
          redirectUri,
          openidConfigurationUrl,
          organizationName: 'Oidc Example',
        },
        { openIdClient },
      );

      await oidcAuthenticationService.initializeClientConfig();

      // when
      const { nonce, state } = oidcAuthenticationService.getAuthorizationUrl();

      // then
      expect(nonce).to.match(uuidV4Regex);
      expect(state).to.match(uuidV4Regex);

      expect(openIdClient.buildAuthorizationUrl).to.have.been.calledWithExactly(MOCK_OIDC_PROVIDER_CONFIG, {
        nonce,
        redirect_uri: 'https://example.org/please-redirect-to-me',
        scope: 'openid profile',
        state,
      });
    });

    context('when generating the authorization url fails', function () {
      it('throws an error and logs a message in datadog', async function () {
        // given
        const clientId = 'clientId';
        const clientSecret = 'clientSecret';
        const identityProvider = 'identityProvider';
        const redirectUri = 'https://example.org/please-redirect-to-me';
        const openidConfigurationUrl = 'https://example.org/oidc-provider-configuration';
        const errorThrown = new Error('Fails to generate authorization url');

        openIdClient.buildAuthorizationUrl.throws(errorThrown);

        const oidcAuthenticationService = new OidcAuthenticationService(
          {
            clientId,
            clientSecret,
            identityProvider,
            redirectUri,
            openidConfigurationUrl,
            organizationName: 'Oidc Example',
          },
          { openIdClient },
        );
        await oidcAuthenticationService.initializeClientConfig();

        // when
        const error = catchErrSync(oidcAuthenticationService.getAuthorizationUrl, oidcAuthenticationService)();

        // then
        expect(error).to.be.instanceOf(OidcError);
        expect(error.message).to.be.equal('Fails to generate authorization url');
        expect(logger.error).to.have.been.calledWithExactly({
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
      const idToken = jsonwebtoken.sign(
        {
          given_name: 'givenName',
          family_name: 'familyName',
          nonce: 'nonce-id',
          sub: 'sub-id',
        },
        'secret',
      );

      const oidcAuthenticationService = new OidcAuthenticationService({}, { openIdClient });

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
          { openIdClient },
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
        const oidcAuthenticationService = new OidcAuthenticationService({ claimMapping }, { openIdClient });

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
          { openIdClient },
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

        const oidcAuthenticationService = new OidcAuthenticationService({}, { openIdClient });
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
          { openIdClient },
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

      openIdClient.fetchUserInfo.returns({
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
        { openIdClient },
      );

      await oidcAuthenticationService.initializeClientConfig();

      const accessToken = 'thisIsSerializedInformation';

      // when
      const pickedUserInfo = await oidcAuthenticationService._getUserInfoFromEndpoint({
        accessToken,
        expectedSubject: 'sub-id',
      });

      // then
      expect(openIdClient.fetchUserInfo).to.have.been.calledOnceWithExactly(
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

    context('when OpenId Client userinfo fails', function () {
      it('throws an error and logs a message in datadog', async function () {
        const clientId = 'OIDC_CLIENT_ID';
        const clientSecret = 'OIDC_CLIENT_SECRET';
        const identityProvider = 'identityProvider';
        const redirectUri = 'https://example.org/please-redirect-to-me';
        const openidConfigurationUrl = 'https://example.org/oidc-provider-configuration';
        const errorThrown = new Error('Fails to get user info');

        openIdClient.fetchUserInfo.rejects(errorThrown);

        const oidcAuthenticationService = new OidcAuthenticationService(
          {
            clientId,
            clientSecret,
            identityProvider,
            redirectUri,
            openidConfigurationUrl,
            organizationName: 'Oidc Example',
          },
          { openIdClient },
        );
        await oidcAuthenticationService.initializeClientConfig();

        // when
        const error = await catchErr(oidcAuthenticationService._getUserInfoFromEndpoint, oidcAuthenticationService)({});

        // then
        expect(error).to.be.instanceOf(OidcError);
        expect(error.message).to.be.equal('Fails to get user info');
        expect(logger.error).to.have.been.calledWithExactly({
          message: errorThrown.message,
          context: 'oidc',
          data: { organizationName: 'Oidc Example' },
          error: { name: errorThrown.name },
          event: 'get-user-info-from-endpoint',
          team: 'acces',
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

        openIdClient.fetchUserInfo.returns({
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
          { openIdClient },
        );

        await oidcAuthenticationService.initializeClientConfig();

        const accessToken = 'thisIsSerializedInformation';
        const errorMessage = `Un ou des champs obligatoires (family_name) n'ont pas été renvoyés par votre fournisseur d'identité Oidc Example.`;

        // when
        const error = await catchErr(
          oidcAuthenticationService._getUserInfoFromEndpoint,
          oidcAuthenticationService,
        )({ accessToken, expectedSubject: 'sub-id' });

        // then
        expect(error).to.be.instanceOf(OidcMissingFieldsError);
        expect(error.message).to.be.equal(errorMessage);
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
          },
          event: 'find-missing-required-claims',
          message: errorMessage,
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

        openIdClient.fetchUserInfo.returns({
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
          { openIdClient },
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
      const oidcAuthenticationService = new OidcAuthenticationService({ identityProvider }, { openIdClient });

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
        const oidcAuthenticationService = new OidcAuthenticationService({ identityProvider }, { openIdClient });

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
          { openIdClient },
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
    it('creates an openid client', async function () {
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
        { openIdClient },
      );

      // when
      await oidcAuthenticationService.initializeClientConfig();

      // then
      expect(openIdClient.discovery).to.have.been.calledWithExactly(new URL(openidConfigurationUrl), clientId, {
        client_secret: clientSecret,
      });
    });

    it('creates an openid client with extra meatadata', async function () {
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
        { openIdClient },
      );

      // when
      await oidcAuthenticationService.initializeClientConfig();

      // then
      expect(openIdClient.discovery).to.have.been.calledWithExactly(new URL(openidConfigurationUrl), clientId, {
        client_secret: clientSecret,
        token_endpoint_auth_method: 'client_secret_post',
      });
    });
  });
});
