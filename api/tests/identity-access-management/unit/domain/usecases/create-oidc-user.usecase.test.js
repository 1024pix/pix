import sinon from 'sinon';

import { AuthenticationKeyExpired } from '../../../../../src/identity-access-management/domain/errors.js';
import { UserAccessToken } from '../../../../../src/identity-access-management/domain/models/UserAccessToken.js';
import { createOidcUser } from '../../../../../src/identity-access-management/domain/usecases/create-oidc-user.usecase.js';
import { UserAlreadyExistsWithAuthenticationMethodError } from '../../../../../src/shared/domain/errors.js';
import { RequestedApplication } from '../../../../../src/shared/infrastructure/utils/network.js';
import { expect } from '../../../../test-helper.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Identity Access Management | Domain | UseCase | create-oidc-user', function () {
  let authenticationMethodRepository;
  let userToCreateRepository;
  let legalDocumentApiRepository;
  let authenticationSessionService;
  let oidcAuthenticationService;
  let oidcAuthenticationServiceRegistry;
  let userLoginRepository;
  let lastUserApplicationConnectionsRepository;
  const accessTokenLifespanSeconds = 48 * 60 * 60;

  beforeEach(function () {
    authenticationMethodRepository = {
      findOneByExternalIdentifierAndIdentityProvider: sinon.stub(),
      updateLastLoggedAtByIdentityProvider: sinon.stub(),
    };

    legalDocumentApiRepository = {
      acceptPixAppTos: sinon.stub(),
    };

    authenticationSessionService = {
      getByKey: sinon.stub(),
      generateSessionId: sinon.stub().returns('random-session-id'),
    };

    oidcAuthenticationService = {
      shouldCloseSession: true,
      accessTokenLifespanMs: accessTokenLifespanSeconds * 1000,
      sessionDurationSeconds: accessTokenLifespanSeconds,
      getUserInfo: sinon.stub(),
      createUserAccount: sinon.stub(),
      saveIdToken: sinon.stub(),
    };

    oidcAuthenticationServiceRegistry = {
      getOidcProviderServiceByCode: sinon.stub().returns(oidcAuthenticationService),
    };

    userLoginRepository = {
      updateLastLoggedAt: sinon.stub().resolves(),
    };

    lastUserApplicationConnectionsRepository = {
      upsert: sinon.stub().resolves(),
    };
  });

  context('when authentication key is expired', function () {
    it('throws an AuthenticationKeyExpiredError', async function () {
      // given
      const authenticationKey = 'authenticationKey';
      authenticationSessionService.getByKey.withArgs(authenticationKey).resolves(null);

      // when
      const error = await catchErr(createOidcUser)({
        authenticationKey,
        authenticationMethodRepository,
        userToCreateRepository,
        legalDocumentApiRepository,
        authenticationSessionService,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationKeyExpired);
      expect(error.message).to.be.equal('This authentication key has expired.');
    });
  });

  context('when there is already an authentication method for this external id', function () {
    it('throws an UserAlreadyExistsWithAuthenticationMethodError', async function () {
      // given
      authenticationSessionService.getByKey.withArgs('AUTHENTICATION_KEY').resolves({
        sessionContent: { idToken: 'idToken', accessToken: 'accessToken' },
        userInfo: { firstName: 'Jean', lastName: 'Heymar', externalIdentityId: 'duGAR' },
      });
      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
        .withArgs({ externalIdentifier: 'duGAR', identityProvider: 'SOME_IDP' })
        .resolves({ userId: 'FOUND_USER_ID' });

      // when
      const error = await catchErr(createOidcUser)({
        identityProvider: 'SOME_IDP',
        authenticationKey: 'AUTHENTICATION_KEY',
        authenticationSessionService,
        oidcAuthenticationServiceRegistry,
        authenticationMethodRepository,
        userToCreateRepository,
        legalDocumentApiRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserAlreadyExistsWithAuthenticationMethodError);
      expect(error.message).to.equal('Authentication method already exists for this external identifier.');
    });
  });

  context('when the user account is created', function () {
    it('returns the access token and the logout url uuid', async function () {
      // given
      const identityProvider = 'SOME_IDP';
      const audience = 'https://app.pix.fr';
      const userId = 'CREATED_USER_ID';
      const requestedApplication = new RequestedApplication({ applicationName: 'app', applicationTld: '.fr' });
      const sessionContent = { idToken: 'idToken' };
      const userInfo = { firstName: 'Jean', lastName: 'Heymar', externalIdentityId: 'duGAR' };

      authenticationSessionService.getByKey.withArgs('AUTHENTICATION_KEY').resolves({
        sessionContent,
        userInfo,
      });
      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
        .withArgs({ externalIdentifier: 'duGAR', identityProvider })
        .resolves(null);
      oidcAuthenticationService.createUserAccount.resolves(userId);
      sinon.stub(UserAccessToken, 'generateOidcUserToken').returns({ accessToken: 'accessToken' });
      oidcAuthenticationService.saveIdToken
        .withArgs({ idToken: sessionContent.idToken, userId })
        .resolves('logoutUrlUUID');

      // when
      const result = await createOidcUser({
        identityProvider,
        authenticationKey: 'AUTHENTICATION_KEY',
        locale: 'fr-FR',
        audience,
        authenticationSessionService,
        oidcAuthenticationServiceRegistry,
        legalDocumentApiRepository,
        authenticationMethodRepository,
        userToCreateRepository,
        userLoginRepository,
        lastUserApplicationConnectionsRepository,
        requestedApplication,
      });

      // then
      expect(legalDocumentApiRepository.acceptPixAppTos).to.have.been.calledWithExactly({ userId });
      expect(userLoginRepository.updateLastLoggedAt).to.have.been.calledWithExactly({ userId });
      expect(authenticationMethodRepository.updateLastLoggedAtByIdentityProvider).to.have.been.calledWithExactly({
        userId,
        identityProvider,
      });
      expect(UserAccessToken.generateOidcUserToken).to.have.been.calledWithExactly({
        userId,
        audience,
        sessionId: 'random-session-id',
        expiresIn: accessTokenLifespanSeconds,
      });
      expect(result).to.deep.equal({
        accessToken: 'accessToken',
        logoutUrlUUID: 'logoutUrlUUID',
      });
    });
  });
});
