import {
  AuthenticationKeyExpired,
  DifferentExternalIdentifierError,
} from '../../../../../src/identity-access-management/domain/errors.js';
import { findUserForOidcReconciliation } from '../../../../../src/identity-access-management/domain/usecases/find-user-for-oidc-reconciliation.usecase.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | find-user-for-oidc-reconciliation', function () {
  let authenticationMethodRepository, userRepository, pixAuthenticationService, authenticationSessionService;

  beforeEach(function () {
    authenticationMethodRepository = {
      findByUserId: sinon.stub(),
      updateAuthenticationComplementByUserIdAndIdentityProvider: sinon.stub(),
    };
    userRepository = { updateLastLoggedAt: sinon.stub() };
    pixAuthenticationService = { getUserByUsernameAndPassword: sinon.stub() };
    authenticationSessionService = { getByKey: sinon.stub(), update: sinon.stub() };
  });

  context('when authentication key is valid', function () {
    it('retrieves user session content', async function () {
      // given
      authenticationMethodRepository.findByUserId.resolves([]);
      pixAuthenticationService.getUserByUsernameAndPassword.resolves({ id: 2 });
      authenticationSessionService.getByKey.resolves({
        sessionContent: { idToken: 'idToken' },
        userInfo: { firstName: 'Anne' },
      });

      // when
      await findUserForOidcReconciliation({
        authenticationKey: 'authenticationKey',
        email: 'ane.trotro@example.net',
        password: 'pix123',
        identityProvider: 'oidc',
        authenticationSessionService,
        pixAuthenticationService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(authenticationSessionService.getByKey).to.be.calledOnceWith('authenticationKey');
    });

    it('updates the session content with the found user id', async function () {
      // given
      const authenticationKey = 'authenticationKey';
      authenticationMethodRepository.findByUserId.resolves([]);
      pixAuthenticationService.getUserByUsernameAndPassword.resolves({ id: 2 });
      const sessionContentAndUserInfo = {
        sessionContent: { idToken: 'idToken' },
        userInfo: { firstName: 'Anne' },
      };
      authenticationSessionService.getByKey.withArgs(authenticationKey).resolves(sessionContentAndUserInfo);

      // when
      await findUserForOidcReconciliation({
        authenticationKey,
        email: 'ane.trotro@example.net',
        password: 'pix123',
        identityProvider: 'oidc',
        authenticationSessionService,
        pixAuthenticationService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      sessionContentAndUserInfo.userInfo.userId = 2;
      expect(authenticationSessionService.update).to.be.calledOnceWith(authenticationKey, sessionContentAndUserInfo);
    });
  });

  context('when authentication key is expired', function () {
    it('throws an AuthenticationKeyExpired', async function () {
      // given
      authenticationSessionService.getByKey.resolves(null);

      // when
      const error = await catchErr(findUserForOidcReconciliation)({
        authenticationKey: 'authenticationKey',
        email: 'ane.trotro@example.net',
        password: 'pix123',
        identityProvider: 'oidc',
        authenticationSessionService,
        pixAuthenticationService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationKeyExpired);
      expect(error.message).to.be.equal('This authentication key has expired.');
    });
  });

  context('when user account is found', function () {
    it('returns authentication methods and full names', async function () {
      // given
      const firstName = 'Sarah';
      const lastName = 'Pix';
      const sessionContentAndUserInfo = {
        sessionContent: { idToken: 'idToken' },
        userInfo: { firstName: 'Sarah', lastName: 'Idp' },
      };
      const pixAuthenticationMethod =
        domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({});
      authenticationMethodRepository.findByUserId.resolves([pixAuthenticationMethod]);
      pixAuthenticationService.getUserByUsernameAndPassword.resolves({
        id: 2,
        firstName,
        lastName,
        email: 'sarahcroche@example.net',
        username: 'sarahcroche123',
      });
      authenticationSessionService.getByKey.resolves(sessionContentAndUserInfo);

      // when
      const result = await findUserForOidcReconciliation({
        authenticationKey: 'authenticationKey',
        email: 'ane.trotro@example.net',
        password: 'pix123',
        identityProvider: 'oidc',
        authenticationSessionService,
        pixAuthenticationService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(authenticationSessionService.update).to.be.calledOnceWith('authenticationKey', sessionContentAndUserInfo);
      expect(result).to.deep.equal({
        fullNameFromPix: 'Sarah Pix',
        fullNameFromExternalIdentityProvider: 'Sarah Idp',
        email: 'sarahcroche@example.net',
        username: 'sarahcroche123',
        authenticationMethods: [pixAuthenticationMethod],
      });
    });
  });

  context('when user has an oidc authentication method and external identifiers are different', function () {
    it('throws an DifferentExternalIdentifierError', async function () {
      // given
      const oidcAuthenticationMethod = domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
        externalIdentifier: '789fge',
      });
      pixAuthenticationService.getUserByUsernameAndPassword.resolves({ id: 2 });
      authenticationMethodRepository.findByUserId.resolves([oidcAuthenticationMethod]);
      authenticationSessionService.getByKey.resolves({
        sessionContent: {},
        userInfo: { externalIdentityId: '123abc' },
      });

      // when
      const error = await catchErr(findUserForOidcReconciliation)({
        authenticationKey: 'authenticationKey',
        email: 'ane.trotro@example.net',
        password: 'pix123',
        identityProvider: 'POLE_EMPLOI',
        authenticationSessionService,
        pixAuthenticationService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(DifferentExternalIdentifierError);
    });
  });
});
