import { POLE_EMPLOI } from '../../../../../lib/domain/constants/oidc-identity-providers.js';
import { AuthenticationMethod } from '../../../../../lib/domain/models/AuthenticationMethod.js';
import { AuthenticationSessionContent } from '../../../../../lib/domain/models/AuthenticationSessionContent.js';
import * as appMessages from '../../../../../src/authorization/domain/constants.js';
import { authenticateOidcUser } from '../../../../../src/identity-access-management/domain/usecases/authenticate-oidc-user.usecase.js';
import { ForbiddenAccess } from '../../../../../src/shared/domain/errors.js';
import { AdminMember } from '../../../../../src/shared/domain/models/AdminMember.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | authenticate-oidc-user', function () {
  context('when identityProvider is generic', function () {
    let oidcAuthenticationService;
    let authenticationSessionService;
    let authenticationMethodRepository;
    let userRepository;
    let adminMemberRepository;
    let userLoginRepository;
    let oidcAuthenticationServiceRegistry;
    const externalIdentityId = '094b83ac-2e20-4aa8-b438-0bc91748e4a6';

    beforeEach(function () {
      oidcAuthenticationService = {
        identityProvider: 'OIDC_EXAMPLE_NET',
        createAccessToken: sinon.stub(),
        shouldCloseSession: true,
        saveIdToken: sinon.stub(),
        createAuthenticationComplement: sinon.stub(),
        exchangeCodeForTokens: sinon.stub(),
        getUserInfo: sinon.stub(),
      };
      oidcAuthenticationServiceRegistry = {
        loadOidcProviderServices: sinon.stub().resolves(),
        configureReadyOidcProviderServiceByCode: sinon.stub().resolves(),
        getOidcProviderServiceByCode: sinon.stub().returns(oidcAuthenticationService),
      };
      authenticationMethodRepository = {
        updateAuthenticationComplementByUserIdAndIdentityProvider: sinon.stub(),
      };
      authenticationSessionService = {
        save: sinon.stub(),
      };
      userRepository = { findByExternalIdentifier: sinon.stub() };
      adminMemberRepository = {
        get: sinon.stub(),
      };
      userLoginRepository = {
        updateLastLoggedAt: sinon.stub().resolves(),
      };
    });

    context('check access by audience', function () {
      context('when audience is pix-admin', function () {
        context('when user has no role and is therefore not an admin member', function () {
          it('throws an error', async function () {
            // given
            const audience = appMessages.PIX_ADMIN.AUDIENCE;
            _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });
            userRepository.findByExternalIdentifier.resolves({ id: 10 });
            adminMemberRepository.get.resolves(null);

            // when
            const error = await catchErr(authenticateOidcUser)({
              audience,
              oidcAuthenticationServiceRegistry,
              userRepository,
              adminMemberRepository,
            });

            // then
            expect(error).to.be.an.instanceOf(ForbiddenAccess);
            expect(error.message).to.be.equal('User does not have the rights to access the application');
            expect(error.code).to.be.equal('PIX_ADMIN_ACCESS_NOT_ALLOWED');
          });
        });

        context('when user has a role but admin membership is disabled', function () {
          it('throws an error', async function () {
            // given
            const audience = appMessages.PIX_ADMIN.AUDIENCE;
            const adminMember = new AdminMember({
              id: 567,
              role: 'CERTIF',
              disabledAt: new Date(),
            });
            _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });
            userRepository.findByExternalIdentifier.resolves({ id: 10 });
            adminMemberRepository.get.resolves(adminMember);

            // when
            const error = await catchErr(authenticateOidcUser)({
              audience,
              oidcAuthenticationServiceRegistry,
              userRepository,
              adminMemberRepository,
            });

            // then
            expect(error).to.be.an.instanceOf(ForbiddenAccess);
            expect(error.message).to.be.equal('User does not have the rights to access the application');
            expect(error.code).to.be.equal('PIX_ADMIN_ACCESS_NOT_ALLOWED');
          });
        });
      });
    });

    it('retrieves authentication token', async function () {
      // given
      _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });

      // when
      await authenticateOidcUser({
        code: 'code',
        redirectUri: 'redirectUri',
        sessionState: 'state',
        state: 'state',
        nonce: 'nonce',
        identityProviderCode: 'OIDC_EXAMPLE_NET',
        oidcAuthenticationServiceRegistry,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
      });

      // then
      expect(oidcAuthenticationServiceRegistry.loadOidcProviderServices).to.have.been.calledOnce;
      expect(oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode).to.have.been.calledWithExactly(
        'OIDC_EXAMPLE_NET',
      );
      expect(oidcAuthenticationService.exchangeCodeForTokens).to.have.been.calledOnceWithExactly({
        code: 'code',
        redirectUri: 'redirectUri',
        sessionState: 'state',
        state: 'state',
        nonce: 'nonce',
      });
    });

    it('retrieves user info', async function () {
      // given
      const { sessionContent } = _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });

      // when
      await authenticateOidcUser({
        stateReceived: 'state',
        stateSent: 'state',
        identityProviderCode: 'OIDC_EXAMPLE_NET',
        oidcAuthenticationServiceRegistry,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
      });

      // then
      expect(oidcAuthenticationService.getUserInfo).to.have.been.calledWithExactly({
        idToken: sessionContent.idToken,
        accessToken: sessionContent.accessToken,
      });
    });

    it('retrieves user with matching external id and identity provider', async function () {
      // given
      _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });

      // when
      await authenticateOidcUser({
        stateReceived: 'state',
        stateSent: 'state',
        identityProviderCode: 'OIDC_EXAMPLE_NET',
        oidcAuthenticationServiceRegistry,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
      });

      // then
      expect(userRepository.findByExternalIdentifier).to.have.been.calledWithExactly({
        externalIdentityId,
        identityProvider: oidcAuthenticationService.identityProvider,
      });
    });

    context('when user does not have an account', function () {
      it('saves the authentication session and returns the authentication key', async function () {
        // given
        const sessionContent = new AuthenticationSessionContent({
          accessToken: 'accessToken',
          idToken: 'idToken',
          expiresIn: 120,
          refreshToken: 'refreshToken',
        });
        const userInfo = {
          firstName: 'Mélusine',
          lastName: 'TITEGOUTTE',
          email: 'melu@example.net',
          externalIdentityId,
        };

        oidcAuthenticationService.exchangeCodeForTokens.resolves(sessionContent);
        oidcAuthenticationService.getUserInfo
          .withArgs({ idToken: sessionContent.idToken, accessToken: sessionContent.accessToken })
          .resolves(userInfo);

        const authenticationKey = 'aaa-bbb-ccc';
        authenticationSessionService.save.resolves(authenticationKey);
        userRepository.findByExternalIdentifier.resolves(null);

        // when
        const result = await authenticateOidcUser({
          stateReceived: 'state',
          stateSent: 'state',
          identityProviderCode: 'OIDC_EXAMPLE_NET',
          oidcAuthenticationServiceRegistry,
          authenticationSessionService,
          authenticationMethodRepository,
          userRepository,
          userLoginRepository,
        });

        // then
        expect(authenticationSessionService.save).to.have.been.calledWithExactly({ userInfo, sessionContent });
        expect(result).to.deep.equal({
          authenticationKey,
          givenName: 'Mélusine',
          familyName: 'TITEGOUTTE',
          email: 'melu@example.net',
          isAuthenticationComplete: false,
        });
      });

      it('does not create an access token, nor saves the id token in storage, nor updates the last logged date', async function () {
        // given
        _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });
        userRepository.findByExternalIdentifier.resolves(null);

        // when
        await authenticateOidcUser({
          stateReceived: 'state',
          stateSent: 'state',
          identityProviderCode: 'OIDC_EXAMPLE_NET',
          oidcAuthenticationServiceRegistry,
          authenticationSessionService,
          authenticationMethodRepository,
          userRepository,
          userLoginRepository,
        });

        // then
        expect(oidcAuthenticationService.saveIdToken).to.not.have.been.called;
        expect(oidcAuthenticationService.createAccessToken).to.not.have.been.called;
        expect(userLoginRepository.updateLastLoggedAt).to.not.have.been.called;
      });
    });

    context('when user has an account', function () {
      context('when the provider does not have an authentication complement', function () {
        it('updates the authentication method', async function () {
          // given
          _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });
          userRepository.findByExternalIdentifier.resolves({ id: 10 });
          const authenticationComplement = undefined;
          oidcAuthenticationService.createAuthenticationComplement.returns(authenticationComplement);

          // when
          await authenticateOidcUser({
            stateReceived: 'state',
            stateSent: 'state',
            identityProviderCode: 'OIDC_EXAMPLE_NET',
            oidcAuthenticationServiceRegistry,
            authenticationSessionService,
            authenticationMethodRepository,
            userRepository,
            userLoginRepository,
          });

          // then
          expect(
            authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider,
          ).to.have.been.calledWithExactly({
            authenticationComplement,
            userId: 10,
            identityProvider: oidcAuthenticationService.identityProvider,
          });
        });
      });

      context('when the provider has an authentication complement', function () {
        it('updates the authentication method', async function () {
          // given
          _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });
          userRepository.findByExternalIdentifier.resolves({ id: 10 });
          const authenticationComplement = new AuthenticationMethod.OidcAuthenticationComplement({
            family_name: 'TITEGOUTTE',
            given_name: 'Mélusine',
          });
          oidcAuthenticationService.createAuthenticationComplement.returns(authenticationComplement);

          // when
          await authenticateOidcUser({
            stateReceived: 'state',
            stateSent: 'state',
            identityProviderCode: 'OIDC_EXAMPLE_NET',
            oidcAuthenticationServiceRegistry,
            authenticationSessionService,
            authenticationMethodRepository,
            userRepository,
            userLoginRepository,
          });

          // then
          expect(
            authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider,
          ).to.have.been.calledWithExactly({
            authenticationComplement,
            userId: 10,
            identityProvider: oidcAuthenticationService.identityProvider,
          });
        });
      });
    });
  });

  context('when identityProvider is POLE_EMPLOI', function () {
    let oidcAuthenticationService;
    let authenticationSessionService;
    let authenticationMethodRepository;
    let userRepository;
    let userLoginRepository;
    let oidcAuthenticationServiceRegistry;
    const externalIdentityId = '094b83ac-2e20-4aa8-b438-0bc91748e4a6';

    beforeEach(function () {
      oidcAuthenticationService = {
        identityProvider: POLE_EMPLOI.code,
        shouldCloseSession: true,
        createAccessToken: sinon.stub(),
        saveIdToken: sinon.stub(),
        createAuthenticationComplement: sinon.stub(),
        exchangeCodeForTokens: sinon.stub(),
        getUserInfo: sinon.stub(),
      };
      oidcAuthenticationServiceRegistry = {
        loadOidcProviderServices: sinon.stub().resolves(),
        configureReadyOidcProviderServiceByCode: sinon.stub().resolves(),
        getOidcProviderServiceByCode: sinon.stub().returns(oidcAuthenticationService),
      };
      authenticationMethodRepository = {
        updateAuthenticationComplementByUserIdAndIdentityProvider: sinon.stub(),
      };

      authenticationSessionService = {
        save: sinon.stub(),
      };

      userRepository = { findByExternalIdentifier: sinon.stub() };
      userLoginRepository = {
        updateLastLoggedAt: sinon.stub().resolves(),
      };
    });

    context('when user has an account', function () {
      it('updates the authentication method', async function () {
        // given
        const { sessionContent } = _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });
        userRepository.findByExternalIdentifier.resolves({ id: 1 });
        const authenticationComplement = new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
          accessToken: sessionContent.accessToken,
          refreshToken: sessionContent.refreshToken,
          expiredDate: new Date(),
        });
        oidcAuthenticationService.createAuthenticationComplement.returns(authenticationComplement);

        // when
        await authenticateOidcUser({
          stateReceived: 'state',
          stateSent: 'state',
          identityProviderCode: POLE_EMPLOI.code,
          oidcAuthenticationServiceRegistry,
          authenticationSessionService,
          authenticationMethodRepository,
          userRepository,
          userLoginRepository,
        });

        // then
        expect(
          authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider,
        ).to.have.been.calledWithExactly({
          authenticationComplement,
          userId: 1,
          identityProvider: oidcAuthenticationService.identityProvider,
        });
      });

      it('returns an access token, the logout url uuid and update the last logged date with the existing external user id', async function () {
        // given
        const { sessionContent } = _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });
        userRepository.findByExternalIdentifier
          .withArgs({ externalIdentityId, identityProvider: oidcAuthenticationService.identityProvider })
          .resolves({ id: 10 });
        oidcAuthenticationService.createAuthenticationComplement.returns(undefined);
        oidcAuthenticationService.createAccessToken.withArgs(10).returns('accessTokenForExistingExternalUser');
        oidcAuthenticationService.saveIdToken
          .withArgs({ idToken: sessionContent.idToken, userId: 10 })
          .resolves('logoutUrlUUID');

        // when
        const accessToken = await authenticateOidcUser({
          stateReceived: 'state',
          stateSent: 'state',
          identityProviderCode: POLE_EMPLOI.code,
          oidcAuthenticationServiceRegistry,
          authenticationSessionService,
          authenticationMethodRepository,
          userRepository,
          userLoginRepository,
        });

        // then
        sinon.assert.calledOnce(oidcAuthenticationService.createAccessToken);
        sinon.assert.calledOnceWithExactly(userLoginRepository.updateLastLoggedAt, { userId: 10 });
        expect(accessToken).to.deep.equal({
          pixAccessToken: 'accessTokenForExistingExternalUser',
          logoutUrlUUID: 'logoutUrlUUID',
          isAuthenticationComplete: true,
        });
      });
    });

    context('when user is logged with their pix account but also has a separate oidc account', function () {
      it('updates the oidc authentication method', async function () {
        // given
        const { sessionContent } = _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });
        userRepository.findByExternalIdentifier
          .withArgs({ externalIdentityId, identityProvider: oidcAuthenticationService.identityProvider })
          .resolves({ id: 10 });
        const authenticationComplement = new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
          accessToken: sessionContent.accessToken,
          refreshToken: sessionContent.refreshToken,
          expiredDate: new Date(),
        });
        oidcAuthenticationService.createAuthenticationComplement.returns(authenticationComplement);

        // when
        await authenticateOidcUser({
          stateReceived: 'state',
          stateSent: 'state',
          identityProviderCode: POLE_EMPLOI.code,
          oidcAuthenticationServiceRegistry,
          authenticationSessionService,
          authenticationMethodRepository,
          userRepository,
          userLoginRepository,
        });

        // then
        expect(
          authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider,
        ).to.have.been.calledWithExactly({
          authenticationComplement,
          userId: 10,
          identityProvider: oidcAuthenticationService.identityProvider,
        });
      });
    });
  });
});

function _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId }) {
  const sessionContent = new AuthenticationSessionContent({
    accessToken: 'accessToken',
    idToken: 'idToken',
    expiresIn: 120,
    refreshToken: 'refreshToken',
  });
  const userInfo = {
    firstName: 'Mélusine',
    lastName: 'TITEGOUTTE',
    externalIdentityId,
  };

  oidcAuthenticationService.exchangeCodeForTokens.resolves(sessionContent);
  oidcAuthenticationService.getUserInfo
    .withArgs({ idToken: sessionContent.idToken, accessToken: sessionContent.accessToken })
    .resolves(userInfo);

  return { userInfo, sessionContent };
}
