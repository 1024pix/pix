import sinon from 'sinon';

import {
  AuthenticationKeyExpired,
  DifferentExternalIdentifierError,
} from '../../../../../src/identity-access-management/domain/errors.js';
import { AuthenticationMethod } from '../../../../../src/identity-access-management/domain/models/AuthenticationMethod.js';
import { UserAccessToken } from '../../../../../src/identity-access-management/domain/models/UserAccessToken.js';
import { reconcileOidcUserForAdmin } from '../../../../../src/identity-access-management/domain/usecases/reconcile-oidc-user-for-admin.usecase.js';
import { RequestedApplication } from '../../../../../src/shared/infrastructure/utils/network.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Identity Access Management | Domain | UseCase | reconcile-oidc-user-for-admin', function () {
  const identityProvider = 'genericOidcProviderCode';
  const audience = 'https://admin.pix.fr';
  const requestedApplication = new RequestedApplication({ applicationName: 'admin', applicationTld: '.fr' });
  const accessTokenLifespanSeconds = 48 * 60 * 60;

  let authenticationMethodRepository;
  let userRepository;
  let userLoginRepository;
  let lastUserApplicationConnectionsRepository;
  let authenticationSessionService;
  let oidcAuthenticationService;

  beforeEach(function () {
    authenticationMethodRepository = {
      create: sinon.stub(),
      findOneByUserIdAndIdentityProvider: sinon.stub(),
      updateLastLoggedAtByIdentityProvider: sinon.stub(),
    };
    userRepository = { getByEmail: sinon.stub() };
    userLoginRepository = { updateLastLoggedAt: sinon.stub() };
    lastUserApplicationConnectionsRepository = { upsert: sinon.stub() };
    authenticationSessionService = { getByKey: sinon.stub(), generateSessionId: sinon.stub() };
    oidcAuthenticationService = {
      identityProvider,
      accessTokenLifespanMs: accessTokenLifespanSeconds * 1000,
      sessionDurationSeconds: accessTokenLifespanSeconds,
      createAuthenticationComplement: sinon.stub(),
    };
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

  context('when user is reconciled', function () {
    it('creates the authentication method and returns a pix access token including a session id', async function () {
      // given
      const userId = 1;
      const externalIdentifier = '123abc';
      userRepository.getByEmail.resolves({ email: 'anne@example.net', id: userId });
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(null);
      authenticationSessionService.getByKey.resolves({
        sessionContent: {},
        userInfo: { externalIdentityId: externalIdentifier },
      });
      oidcAuthenticationService.createAuthenticationComplement.returns(
        new AuthenticationMethod.OidcAuthenticationComplement({
          accessToken: 'accessToken',
          expiredDate: new Date(),
        }),
      );

      authenticationSessionService.generateSessionId.returns('random-session-id');
      sinon
        .stub(UserAccessToken, 'generateOidcUserToken')
        .withArgs({ userId, audience, sessionId: 'random-session-id', expiresIn: accessTokenLifespanSeconds })
        .returns({ accessToken: 'pixAccessToken' });

      // when
      const accessToken = await reconcileOidcUserForAdmin({
        authenticationKey: 'authenticationKey',
        email: 'anne@example.net',
        identityProvider,
        audience,
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
        lastUserApplicationConnectionsRepository,
        requestedApplication,
      });

      // then
      expect(authenticationMethodRepository.create).to.have.been.calledOnce;
      const { authenticationMethod } = authenticationMethodRepository.create.firstCall.args[0];
      expect(authenticationMethod).to.deep.contain({ identityProvider, externalIdentifier, userId });

      expect(authenticationSessionService.generateSessionId).to.have.been.calledOnce;
      expect(UserAccessToken.generateOidcUserToken).to.have.been.calledWithExactly({
        userId,
        audience,
        sessionId: 'random-session-id',
        expiresIn: accessTokenLifespanSeconds,
      });
      expect(accessToken).to.equal('pixAccessToken');
    });
  });
});
