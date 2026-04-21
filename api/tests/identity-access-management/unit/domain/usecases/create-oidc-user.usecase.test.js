import sinon from 'sinon';

import { AuthenticationKeyExpired } from '../../../../../src/identity-access-management/domain/errors.js';
import { createOidcUser } from '../../../../../src/identity-access-management/domain/usecases/create-oidc-user.usecase.js';
import { UserAlreadyExistsWithAuthenticationMethodError } from '../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Identity Access Management | Domain | UseCase | create-oidc-user', function () {
  let authenticationMethodRepository;
  let userToCreateRepository;
  let authenticationSessionService;
  let oidcAuthenticationService;
  let oidcAuthenticationServiceRegistry;

  beforeEach(function () {
    authenticationMethodRepository = {
      findOneByExternalIdentifierAndIdentityProvider: sinon.stub(),
      updateLastLoggedAtByIdentityProvider: sinon.stub(),
    };

    authenticationSessionService = {
      getByKey: sinon.stub(),
    };

    oidcAuthenticationService = {
      shouldCloseSession: true,
      getUserInfo: sinon.stub(),
      createUserAccount: sinon.stub(),
      createAccessToken: sinon.stub(),
      saveIdToken: sinon.stub(),
    };
    oidcAuthenticationServiceRegistry = {
      getOidcProviderServiceByCode: sinon.stub().returns(oidcAuthenticationService),
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
      });

      // then
      expect(error).to.be.instanceOf(UserAlreadyExistsWithAuthenticationMethodError);
      expect(error.message).to.equal('Authentication method already exists for this external identifier.');
    });
  });
});
