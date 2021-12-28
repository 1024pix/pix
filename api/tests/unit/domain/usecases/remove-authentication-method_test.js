const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const removeAuthenticationMethod = require('../../../../lib/domain/usecases/remove-authentication-method');
const { UserNotAuthorizedToRemoveAuthenticationMethod } = require('../../../../lib/domain/errors');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

describe('Unit | UseCase | remove-authentication-method', function () {
  let userRepository;
  let authenticationMethodRepository;

  beforeEach(function () {
    userRepository = {
      get: sinon.stub(),
      updateEmail: sinon.stub(),
      updateUsername: sinon.stub(),
    };
    authenticationMethodRepository = {
      findByUserId: sinon.stub(),
      removeByUserIdAndIdentityProvider: sinon.stub(),
    };
  });

  function _buildPIXAndGARAndPoleEmploiAuthenticationMethod(userId) {
    return [
      domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId }),
      domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({ userId }),
      domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({ userId }),
    ];
  }

  context('When type is EMAIL', function () {
    it('should set the email to null', async function () {
      // given
      const user = domainBuilder.buildUser();
      userRepository.get.resolves(user);
      const authenticationMethods = _buildPIXAndGARAndPoleEmploiAuthenticationMethod(user.id);
      authenticationMethodRepository.findByUserId.resolves(authenticationMethods);

      // when
      await removeAuthenticationMethod({
        userId: user.id,
        type: 'EMAIL',
        userRepository,
        authenticationMethodRepository,
      });

      // then
      expect(userRepository.updateEmail).to.have.been.calledWith({ id: user.id, email: null });
    });

    context('When user does not have a username', function () {
      it('should NOT remove PIX authentication method', async function () {
        // given
        const user = domainBuilder.buildUser({ username: null });
        userRepository.get.resolves(user);
        const authenticationMethods = _buildPIXAndGARAndPoleEmploiAuthenticationMethod(user.id);
        authenticationMethodRepository.findByUserId.resolves(authenticationMethods);

        // when
        await removeAuthenticationMethod({
          userId: user.id,
          type: 'EMAIL',
          userRepository,
          authenticationMethodRepository,
        });

        // then
        expect(authenticationMethodRepository.removeByUserIdAndIdentityProvider).to.not.have.been.called;
      });
    });

    context('When user has a username', function () {
      it('should remove PIX authentication method', async function () {
        // given
        const user = domainBuilder.buildUser({ username: 'john.doe0101' });
        userRepository.get.resolves(user);
        const authenticationMethods = _buildPIXAndGARAndPoleEmploiAuthenticationMethod(user.id);
        authenticationMethodRepository.findByUserId.resolves(authenticationMethods);

        // when
        await removeAuthenticationMethod({
          userId: user.id,
          type: 'EMAIL',
          userRepository,
          authenticationMethodRepository,
        });

        // then
        expect(authenticationMethodRepository.removeByUserIdAndIdentityProvider).to.have.been.calledWith({
          userId: user.id,
          identityProvider: AuthenticationMethod.identityProviders.PIX,
        });
      });
    });
  });

  context('When type is USERNAME', function () {
    it('should set the username to null', async function () {
      // given
      const user = domainBuilder.buildUser();
      userRepository.get.resolves(user);
      const authenticationMethods = _buildPIXAndGARAndPoleEmploiAuthenticationMethod(user.id);
      authenticationMethodRepository.findByUserId.resolves(authenticationMethods);

      // when
      await removeAuthenticationMethod({
        userId: user.id,
        type: 'USERNAME',
        userRepository,
        authenticationMethodRepository,
      });

      // then
      expect(userRepository.updateUsername).to.have.been.calledWith({ id: user.id, username: null });
    });

    context('When user does not have an email', function () {
      it('should NOT remove PIX authentication method', async function () {
        // given
        const user = domainBuilder.buildUser({ email: null });
        userRepository.get.resolves(user);
        const authenticationMethods = _buildPIXAndGARAndPoleEmploiAuthenticationMethod(user.id);
        authenticationMethodRepository.findByUserId.resolves(authenticationMethods);

        // when
        await removeAuthenticationMethod({
          userId: user.id,
          type: 'USERNAME',
          userRepository,
          authenticationMethodRepository,
        });

        // then
        expect(authenticationMethodRepository.removeByUserIdAndIdentityProvider).to.not.have.been.called;
      });
    });

    context('When user has an email', function () {
      it('should remove PIX authentication method', async function () {
        // given
        const user = domainBuilder.buildUser({ email: 'john.doe@example.net' });
        userRepository.get.resolves(user);
        const authenticationMethods = _buildPIXAndGARAndPoleEmploiAuthenticationMethod(user.id);
        authenticationMethodRepository.findByUserId.resolves(authenticationMethods);

        // when
        await removeAuthenticationMethod({
          userId: user.id,
          type: 'USERNAME',
          userRepository,
          authenticationMethodRepository,
        });

        // then
        expect(authenticationMethodRepository.removeByUserIdAndIdentityProvider).to.have.been.calledWith({
          userId: user.id,
          identityProvider: AuthenticationMethod.identityProviders.PIX,
        });
      });
    });
  });

  context('When type is GAR', function () {
    it('should remove GAR authentication method', async function () {
      // given
      const user = domainBuilder.buildUser();
      userRepository.get.resolves(user);
      const authenticationMethods = _buildPIXAndGARAndPoleEmploiAuthenticationMethod(user.id);
      authenticationMethodRepository.findByUserId.resolves(authenticationMethods);

      // when
      await removeAuthenticationMethod({
        userId: user.id,
        type: 'GAR',
        userRepository,
        authenticationMethodRepository,
      });

      // then
      expect(authenticationMethodRepository.removeByUserIdAndIdentityProvider).to.have.been.calledWith({
        userId: user.id,
        identityProvider: AuthenticationMethod.identityProviders.GAR,
      });
    });
  });

  context('When type is POLE_EMPLOI', function () {
    it('should remove POLE_EMPLOI authentication method', async function () {
      // given
      const user = domainBuilder.buildUser();
      userRepository.get.resolves(user);
      const authenticationMethods = _buildPIXAndGARAndPoleEmploiAuthenticationMethod(user.id);
      authenticationMethodRepository.findByUserId.resolves(authenticationMethods);

      // when
      await removeAuthenticationMethod({
        userId: user.id,
        type: 'POLE_EMPLOI',
        userRepository,
        authenticationMethodRepository,
      });

      // then
      expect(authenticationMethodRepository.removeByUserIdAndIdentityProvider).to.have.been.calledWith({
        userId: user.id,
        identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
      });
    });
  });

  context('When there is only one remaining authentication method', function () {
    it('should throw a UserNotAuthorizedToRemoveAuthenticationMethod', async function () {
      // given
      const user = domainBuilder.buildUser({ email: 'toto@example.net', username: null });
      userRepository.get.resolves(user);
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId: user.id,
      });
      authenticationMethodRepository.findByUserId.resolves([authenticationMethod]);

      // when
      const error = await catchErr(removeAuthenticationMethod)({
        userId: user.id,
        type: 'EMAIL',
        userRepository,
        authenticationMethodRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(UserNotAuthorizedToRemoveAuthenticationMethod);
    });

    it('should not remove the authentication method', async function () {
      // given
      const user = domainBuilder.buildUser();
      userRepository.get.resolves(user);
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId: user.id,
      });
      authenticationMethodRepository.findByUserId.resolves([authenticationMethod]);

      // when
      await catchErr(removeAuthenticationMethod)({
        userId: user.id,
        type: 'EMAIL',
        userRepository,
        authenticationMethodRepository,
      });

      // then
      expect(authenticationMethodRepository.removeByUserIdAndIdentityProvider).to.not.have.been.called;
    });
  });
});
