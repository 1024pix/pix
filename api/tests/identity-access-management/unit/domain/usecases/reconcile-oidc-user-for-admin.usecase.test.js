import {
  AuthenticationKeyExpired,
  DifferentExternalIdentifierError,
} from '../../../../../src/identity-access-management/domain/errors.js';
import { AuthenticationMethod } from '../../../../../src/identity-access-management/domain/models/AuthenticationMethod.js';
import { reconcileOidcUserForAdmin } from '../../../../../src/identity-access-management/domain/usecases/reconcile-oidc-user-for-admin.usecase.js';
import { RequestedApplication } from '../../../../../src/identity-access-management/infrastructure/utils/network.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | reconcile-oidc-user-for-admin', function () {
  let authenticationMethodRepository,
    userRepository,
    userLoginRepository,
    authenticationSessionService,
    lastUserApplicationConnectionsRepository,
    oidcAuthenticationService;
  const identityProvider = 'genericOidcProviderCode';
  const audience = 'https://admin.pix.fr';
  const requestedApplication = new RequestedApplication({ applicationName: 'admin', applicationTld: '.fr' });

  beforeEach(function () {
    authenticationMethodRepository = {
      create: sinon.stub(),
      findOneByUserIdAndIdentityProvider: sinon.stub(),
      updateLastLoggedAtByIdentityProvider: sinon.stub(),
    };
    userRepository = { getByEmail: sinon.stub() };
    userLoginRepository = { updateLastLoggedAt: sinon.stub() };
    authenticationSessionService = { getByKey: sinon.stub() };
    oidcAuthenticationService = {
      identityProvider,
      createAccessToken: sinon.stub(),
      createAuthenticationComplement: sinon.stub(),
    };

    lastUserApplicationConnectionsRepository = {
      upsert: sinon.stub(),
    };
  });

  it('retrieves user session content and user info', async function () {
    // given
    const email = 'anne@example.net';
    const userInfo = { externalIdentityId: 'external_id', firstName: 'Anne', email };
    authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(null);
    userRepository.getByEmail.resolves({ email, id: 2 });
    authenticationSessionService.getByKey.resolves({
      sessionContent: {},
      userInfo,
    });
    oidcAuthenticationService.createAuthenticationComplement.withArgs({ userInfo }).returns(
      new AuthenticationMethod.OidcAuthenticationComplement({
        firstName: 'Anne',
      }),
    );
    // when
    await reconcileOidcUserForAdmin({
      email,
      authenticationKey: 'authenticationKey',
      audience,
      oidcAuthenticationService,
      authenticationSessionService,
      authenticationMethodRepository,
      userRepository,
      userLoginRepository,
      requestedApplication,
      lastUserApplicationConnectionsRepository,
    });

    // then
    expect(authenticationSessionService.getByKey).to.be.calledOnceWith('authenticationKey');
  });

  it('finds user and his authentication methods', async function () {
    // given
    const email = 'sarah.pix@example.net';
    const userInfo = { externalIdentityId: 'external_id', firstName: 'Sarah', email };
    authenticationSessionService.getByKey.resolves({
      sessionContent: {},
      userInfo,
    });
    userRepository.getByEmail.resolves({ email, id: 2 });
    authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(null);
    oidcAuthenticationService.createAuthenticationComplement.withArgs({ userInfo }).returns(
      new AuthenticationMethod.OidcAuthenticationComplement({
        firstName: 'Anne',
      }),
    );

    // when
    await reconcileOidcUserForAdmin({
      email,
      identityProvider,
      authenticationKey: 'authenticationKey',
      audience,
      oidcAuthenticationService,
      authenticationSessionService,
      authenticationMethodRepository,
      userRepository,
      userLoginRepository,
      requestedApplication,
      lastUserApplicationConnectionsRepository,
    });

    // then
    expect(userRepository.getByEmail).to.be.calledOnceWith(email);
    expect(authenticationMethodRepository.findOneByUserIdAndIdentityProvider).to.be.calledOnceWith({
      userId: 2,
      identityProvider,
    });
  });

  it('returns an access token and update the last logged date', async function () {
    // given
    const email = 'anne@example.net';
    const externalIdentifier = 'external_id';
    const userInfo = { externalIdentityId: externalIdentifier, firstName: 'Sarah', email };
    const userId = 1;
    authenticationSessionService.getByKey.resolves({
      sessionContent: {},
      userInfo,
    });
    authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(null);
    userRepository.getByEmail.resolves({ email: 'anne@example.net', id: userId });
    oidcAuthenticationService.createAuthenticationComplement.withArgs({ userInfo }).returns(
      new AuthenticationMethod.OidcAuthenticationComplement({
        firstName: 'Anne',
      }),
    );
    oidcAuthenticationService.createAccessToken.withArgs({ userId, audience }).returns('accessToken');

    // when
    const result = await reconcileOidcUserForAdmin({
      authenticationKey: 'authenticationKey',
      audience,
      oidcAuthenticationService,
      authenticationSessionService,
      authenticationMethodRepository,
      userRepository,
      userLoginRepository,
      requestedApplication,
      lastUserApplicationConnectionsRepository,
    });

    // then
    expect(oidcAuthenticationService.createAccessToken).to.be.calledOnceWith({ userId, audience });
    expect(userLoginRepository.updateLastLoggedAt).to.be.calledOnceWith({ userId });
    expect(result).to.equal('accessToken');
  });

  it('saves the last user connection', async function () {
    // given
    const email = 'anne@example.net';
    const externalIdentifier = 'external_id';
    const userInfo = { externalIdentityId: externalIdentifier, firstName: 'Sarah', email };
    const userId = 1;
    authenticationSessionService.getByKey.resolves({
      sessionContent: {},
      userInfo,
    });
    authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(null);
    userRepository.getByEmail.resolves({ email: 'anne@example.net', id: userId });
    oidcAuthenticationService.createAuthenticationComplement.withArgs({ userInfo }).returns(
      new AuthenticationMethod.OidcAuthenticationComplement({
        firstName: 'Anne',
      }),
    );
    oidcAuthenticationService.createAccessToken.withArgs({ userId, audience }).returns('accessToken');

    // when
    await reconcileOidcUserForAdmin({
      authenticationKey: 'authenticationKey',
      audience,
      oidcAuthenticationService,
      authenticationSessionService,
      authenticationMethodRepository,
      userRepository,
      userLoginRepository,
      requestedApplication,
      lastUserApplicationConnectionsRepository,
    });

    // then
    expect(lastUserApplicationConnectionsRepository.upsert).to.be.calledWithExactly({
      userId,
      application: 'admin',
      lastLoggedAt: sinon.match.instanceOf(Date),
    });
    expect(authenticationMethodRepository.updateLastLoggedAtByIdentityProvider).to.be.calledWithMatch({
      userId,
      identityProvider: oidcAuthenticationService.identityProvider,
    });
  });

  context('when authentication key is expired', function () {
    it('throws an AuthenticationKeyExpired', async function () {
      // given
      authenticationSessionService.getByKey.resolves(null);

      // when
      const error = await catchErr(reconcileOidcUserForAdmin)({
        authenticationKey: 'authenticationKey',
        audience,
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationKeyExpired);
      expect(error.message).to.be.equal('This authentication key has expired.');
    });
  });

  context('when user has an oidc authentication method and external identifiers are different', function () {
    it('throws an DifferentExternalIdentifierError', async function () {
      // given
      const oidcAuthenticationMethod = domainBuilder.buildAuthenticationMethod.withIdentityProvider({
        externalIdentifier: '789fge',
        identityProvider: 'genericOidcProviderCode',
      });
      userRepository.getByEmail.resolves({ email: 'anne@example.net', id: 1 });
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(oidcAuthenticationMethod);
      authenticationSessionService.getByKey.resolves({
        sessionContent: {},
        userInfo: { externalIdentityId: '123abc' },
      });

      // when
      const error = await catchErr(reconcileOidcUserForAdmin)({
        authenticationKey: 'authenticationKey',
        email: 'anne@example.net',
        identityProvider: 'genericOidcProviderCode',
        audience,
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(DifferentExternalIdentifierError);
    });
  });
});
