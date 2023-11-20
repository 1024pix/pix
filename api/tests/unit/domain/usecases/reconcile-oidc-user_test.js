import { expect, sinon, catchErr } from '../../../test-helper.js';

import { PAYSDELALOIRE, POLE_EMPLOI } from '../../../../lib/domain/constants/oidc-identity-providers.js';

import { reconcileOidcUser } from '../../../../lib/domain/usecases/reconcile-oidc-user.js';
import { AuthenticationKeyExpired, MissingUserAccountError } from '../../../../lib/domain/errors.js';
import { AuthenticationMethod } from '../../../../lib/domain/models/AuthenticationMethod.js';

describe('Unit | UseCase | reconcile-oidc-user', function () {
  context('when identityProvider is generic', function () {
    let identityProvider;
    let authenticationMethodRepository;
    let userLoginRepository;
    let authenticationSessionService;
    let oidcAuthenticationService;

    beforeEach(function () {
      identityProvider = PAYSDELALOIRE.code;
      authenticationMethodRepository = { create: sinon.stub() };
      userLoginRepository = {
        updateLastLoggedAt: sinon.stub(),
      };
      authenticationSessionService = { getByKey: sinon.stub() };
      oidcAuthenticationService = {
        identityProvider,
        createAccessToken: sinon.stub(),
        saveIdToken: sinon.stub(),
        createAuthenticationComplement: sinon.stub(),
      };
    });

    context('when authentication key is expired', function () {
      it('throws an AuthenticationKeyExpired', async function () {
        // given
        authenticationSessionService.getByKey.resolves(null);

        // when
        const error = await catchErr(reconcileOidcUser)({
          authenticationKey: 'authenticationKey',
          oidcAuthenticationService,
          authenticationSessionService,
          authenticationMethodRepository,
          userLoginRepository,
        });

        // then
        expect(error).to.be.instanceOf(AuthenticationKeyExpired);
        expect(error.message).to.be.equal('This authentication key has expired.');
      });
    });

    it('looks for user session content', async function () {
      // given
      const sessionContent = { idToken: 'idToken' };
      authenticationSessionService.getByKey.resolves({
        sessionContent,
        userInfo: { userId: 1, externalIdentityId: 'external_id', firstName: 'Anne' },
      });

      // when
      await reconcileOidcUser({
        authenticationKey: 'authenticationKey',
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userLoginRepository,
      });

      // then
      expect(authenticationSessionService.getByKey).to.be.calledOnceWith('authenticationKey');
    });

    context('when user id is not stored in session info', function () {
      it('throws an MissingUserAccountError', async function () {
        // given
        authenticationSessionService.getByKey.resolves({
          sessionContent: { idToken: 'idToken' },
        });

        // when
        const error = await catchErr(reconcileOidcUser)({
          authenticationKey: 'authenticationKey',
          oidcAuthenticationService,
          authenticationSessionService,
          authenticationMethodRepository,
          userLoginRepository,
        });

        // then
        expect(error).to.be.instanceOf(MissingUserAccountError);
        expect(error.message).to.be.equal('Les informations de compte requises sont manquantes');
      });
    });

    it('creates authentication method with complement', async function () {
      // given
      const sessionContent = { idToken: 'idToken' };
      const externalIdentifier = 'external_id';
      const userId = 1;
      const userInfo = { userId, externalIdentityId: externalIdentifier, firstName: 'Anne' };
      authenticationSessionService.getByKey.resolves({
        sessionContent,
        userInfo,
      });
      oidcAuthenticationService.createAuthenticationComplement.withArgs({ userInfo, sessionContent }).returns(
        new AuthenticationMethod.OidcAuthenticationComplement({
          accessToken: 'accessToken',
          expiredDate: new Date(),
        }),
      );

      // when
      await reconcileOidcUser({
        authenticationKey: 'authenticationKey',
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userLoginRepository,
      });

      // then
      expect(authenticationMethodRepository.create).to.be.calledOnce;
      const { authenticationMethod } = authenticationMethodRepository.create.firstCall.args[0];
      expect(authenticationMethod).to.deep.contain({ identityProvider, externalIdentifier, userId });
      expect(authenticationMethod.authenticationComplement).to.be.instanceOf(
        AuthenticationMethod.OidcAuthenticationComplement,
      );
    });
  });

  context('when identityProvider is POLE_EMPLOI', function () {
    let identityProvider;
    let authenticationMethodRepository;
    let userLoginRepository;
    let authenticationSessionService;
    let oidcAuthenticationService;

    beforeEach(function () {
      identityProvider = POLE_EMPLOI.code;
      authenticationMethodRepository = { create: sinon.stub() };
      userLoginRepository = {
        updateLastLoggedAt: sinon.stub(),
      };
      authenticationSessionService = { getByKey: sinon.stub() };
      oidcAuthenticationService = {
        identityProvider,
        createAccessToken: sinon.stub(),
        saveIdToken: sinon.stub(),
        createAuthenticationComplement: sinon.stub(),
      };
    });

    it('creates authentication method with complement', async function () {
      // given
      const sessionContent = { idToken: 'idToken' };
      const externalIdentifier = 'external_id';
      const userId = 1;
      const userInfo = { userId, externalIdentityId: externalIdentifier, firstName: 'Anne' };
      authenticationSessionService.getByKey.resolves({
        sessionContent,
        userInfo,
      });
      oidcAuthenticationService.createAuthenticationComplement.withArgs({ userInfo, sessionContent }).returns(
        new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
          accessToken: 'accessToken',
          expiredDate: new Date(),
        }),
      );

      // when
      await reconcileOidcUser({
        authenticationKey: 'authenticationKey',
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userLoginRepository,
      });

      // then
      expect(authenticationMethodRepository.create).to.be.calledOnce;
      const { authenticationMethod } = authenticationMethodRepository.create.firstCall.args[0];
      expect(authenticationMethod).to.deep.contain({ identityProvider, externalIdentifier, userId });
      expect(authenticationMethod.authenticationComplement).to.be.instanceOf(
        AuthenticationMethod.PoleEmploiOidcAuthenticationComplement,
      );
    });

    it('returns an access token, the logout url uuid and updates the last logged date', async function () {
      // given
      const sessionContent = { idToken: 'idToken' };
      const externalIdentifier = 'external_id';
      const userId = 1;
      const userInfo = { userId, externalIdentityId: externalIdentifier, firstName: 'Anne' };
      authenticationSessionService.getByKey.resolves({
        sessionContent,
        userInfo,
      });
      oidcAuthenticationService.createAuthenticationComplement.withArgs({ userInfo, sessionContent }).returns(
        new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
          accessToken: 'accessToken',
          expiredDate: new Date(),
        }),
      );
      oidcAuthenticationService.createAccessToken.withArgs(userId).returns('accessToken');
      oidcAuthenticationService.saveIdToken
        .withArgs({ idToken: sessionContent.idToken, userId })
        .resolves('logoutUrlUUID');

      // when
      const result = await reconcileOidcUser({
        authenticationKey: 'authenticationKey',
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userLoginRepository,
      });

      // then
      sinon.assert.calledOnce(oidcAuthenticationService.createAccessToken);
      sinon.assert.calledOnce(oidcAuthenticationService.saveIdToken);
      sinon.assert.calledOnceWithExactly(userLoginRepository.updateLastLoggedAt, { userId });
      expect(result).to.deep.equal({
        accessToken: 'accessToken',
        logoutUrlUUID: 'logoutUrlUUID',
      });
    });
  });
});
