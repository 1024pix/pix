const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const reassignGarAuthenticationMethod = require('../../../../lib/domain/usecases/reassign-gar-authentication-method');
const {
  AuthenticationMethodNotFoundError,
  AuthenticationMethodAlreadyExistsError,
} = require('../../../../lib/domain/errors');

describe('Unit | UseCase | reassign-gar-authentication-method', function () {
  let authenticationMethodRepository, userRepository;

  beforeEach(function () {
    userRepository = {
      get: sinon.stub(),
    };
    authenticationMethodRepository = {
      updateAuthenticationMethodUserId: sinon.stub(),
      findOneByUserIdAndIdentityProvider: sinon.stub(),
    };
  });

  context('when no gar authentication method exists for origin user', function () {
    it('should not update gar authentication method user id', async function () {
      // given
      const originUser = domainBuilder.buildUser({ id: 1 });

      userRepository.get.withArgs(originUser.id).resolves(originUser);
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider
        .withArgs({ userId: originUser.id, identityProvider: AuthenticationMethod.identityProviders.GAR })
        .resolves(null);

      // when
      const error = await catchErr(reassignGarAuthenticationMethod)({
        originUserId: originUser.id,
        userRepository,
        authenticationMethodRepository,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
      expect(error.message).to.equal("L'utilisateur 1 n'a pas de méthode de connexion GAR.");
    });
  });

  context('when target user has already gar authentication method', function () {
    it('should not update gar authentication method user id', async function () {
      // given
      const garIdentityProvider = AuthenticationMethod.identityProviders.GAR;

      const originUser = domainBuilder.buildUser({ id: 1 });
      const garAuthenticationMethodFromOriginUser = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: originUser.id,
      });
      const targetUser = domainBuilder.buildUser({ id: 2 });
      const garAuthenticationMethodFromTargetUser = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: targetUser.id,
      });

      userRepository.get.withArgs(originUser.id).resolves(originUser);
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider
        .withArgs({ userId: originUser.id, identityProvider: garIdentityProvider })
        .resolves(garAuthenticationMethodFromOriginUser);

      userRepository.get.withArgs(targetUser.id).resolves(targetUser);
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider
        .withArgs({ userId: targetUser.id, identityProvider: garIdentityProvider })
        .resolves(garAuthenticationMethodFromTargetUser);

      // when
      const error = await catchErr(reassignGarAuthenticationMethod)({
        originUserId: originUser.id,
        targetUserId: targetUser.id,
        userRepository,
        authenticationMethodRepository,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationMethodAlreadyExistsError);
      expect(error.message).to.equal("L'utilisateur 2 a déjà une méthode de connexion GAR.");
    });
  });

  it('should update gar authentication method user id', async function () {
    // given
    const garIdentityProvider = AuthenticationMethod.identityProviders.GAR;

    const originUser = domainBuilder.buildUser({ id: 1 });
    const garAuthenticationMethod = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
      userId: originUser.id,
    });
    const targetUser = domainBuilder.buildUser({ id: 2 });
    domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
      userId: targetUser.id,
    });

    userRepository.get.withArgs(originUser.id).resolves(originUser);
    authenticationMethodRepository.findOneByUserIdAndIdentityProvider
      .withArgs({ userId: originUser.id, identityProvider: garIdentityProvider })
      .resolves(garAuthenticationMethod);

    userRepository.get.withArgs(targetUser.id).resolves(targetUser);
    authenticationMethodRepository.findOneByUserIdAndIdentityProvider
      .withArgs({ userId: targetUser.id, identityProvider: garIdentityProvider })
      .resolves(null);

    // when
    await reassignGarAuthenticationMethod({
      originUserId: originUser.id,
      targetUserId: targetUser.id,
      userRepository,
      authenticationMethodRepository,
    });

    // then
    expect(authenticationMethodRepository.updateAuthenticationMethodUserId).to.have.been.calledOnceWith({
      originUserId: originUser.id,
      identityProvider: garIdentityProvider,
      targetUserId: targetUser.id,
    });
  });
});
