const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const reassignAuthenticationMethodToAnotherUser = require('../../../../lib/domain/usecases/reassign-authentication-method-to-another-user');
const {
  AuthenticationMethodNotFoundError,
  AuthenticationMethodAlreadyExistsError,
} = require('../../../../lib/domain/errors');

describe('Unit | UseCase | reassign-authentication-method-to-another-user', function () {
  let authenticationMethodRepository, userRepository;

  beforeEach(function () {
    userRepository = {
      get: sinon.stub(),
    };
    authenticationMethodRepository = {
      updateAuthenticationMethodUserId: sinon.stub(),
      findByUserId: sinon.stub(),
    };
  });

  context('When authentication method id does not match with origin user id', function () {
    it('should throw an error', async function () {
      // given
      const wrongAuthenticationMethodId = 1234;
      const originUserId = domainBuilder.buildUser({ id: 1 }).id;
      domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: originUserId,
      });
      const targetUserId = domainBuilder.buildUser({ id: 2 }).id;

      authenticationMethodRepository.findByUserId.withArgs({ userId: originUserId }).resolves([]);

      // when
      const error = await catchErr(reassignAuthenticationMethodToAnotherUser)({
        originUserId,
        targetUserId,
        userRepository,
        authenticationMethodId: wrongAuthenticationMethodId,
        authenticationMethodRepository,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationMethodNotFoundError);
      expect(error.message).to.equal("La méthode de connexion 1234 n'est pas rattachée à l'utilisateur 1.");
    });
  });

  context('When target user already has an authentication method with same identity provider', function () {
    it('should throw an error', async function () {
      // given
      const originUserId = domainBuilder.buildUser({ id: 1 }).id;
      const garAuthenticationMethodFromOriginUser = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: originUserId,
      });
      const targetUserId = domainBuilder.buildUser({ id: 2 }).id;
      const garAuthenticationMethodFromTargetUser = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: targetUserId,
      });
      const poleEmploiAuthenticationMethodFromTargetUser =
        domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({ userId: targetUserId });

      authenticationMethodRepository.findByUserId
        .withArgs({ userId: originUserId })
        .resolves([garAuthenticationMethodFromOriginUser]);
      authenticationMethodRepository.findByUserId
        .withArgs({ userId: targetUserId })
        .resolves([garAuthenticationMethodFromTargetUser, poleEmploiAuthenticationMethodFromTargetUser]);

      // when
      const error = await catchErr(reassignAuthenticationMethodToAnotherUser)({
        originUserId: originUserId,
        targetUserId: targetUserId,
        authenticationMethodId: garAuthenticationMethodFromOriginUser.id,
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
    const originUserId = domainBuilder.buildUser({ id: 1 }).id;
    const garAuthenticationMethodFromOriginUser = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
      userId: originUserId,
    });
    const targetUserId = domainBuilder.buildUser({ id: 2 }).id;
    const poleEmploiAuthenticationMethodFromTargetUser =
      domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({ userId: targetUserId });

    authenticationMethodRepository.findByUserId
      .withArgs({ userId: originUserId })
      .resolves([garAuthenticationMethodFromOriginUser]);
    authenticationMethodRepository.findByUserId
      .withArgs({ userId: targetUserId })
      .resolves([poleEmploiAuthenticationMethodFromTargetUser]);

    // when
    await reassignAuthenticationMethodToAnotherUser({
      originUserId: originUserId,
      targetUserId: targetUserId,
      authenticationMethodId: garAuthenticationMethodFromOriginUser.id,
      userRepository,
      authenticationMethodRepository,
    });

    // then
    expect(authenticationMethodRepository.updateAuthenticationMethodUserId).to.have.been.calledOnceWith({
      originUserId: originUserId,
      identityProvider: 'GAR',
      targetUserId: targetUserId,
    });
  });

  it('should update pole emploi authentication method user id', async function () {
    // given
    const originUserId = domainBuilder.buildUser({ id: 1 }).id;
    const poleEmploiAuthenticationMethodFromOriginUser =
      domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
        userId: originUserId,
      });
    const targetUserId = domainBuilder.buildUser({ id: 2 }).id;
    const garAuthenticationMethodFromTargetUser = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
      userId: targetUserId,
    });

    authenticationMethodRepository.findByUserId
      .withArgs({ userId: originUserId })
      .resolves([poleEmploiAuthenticationMethodFromOriginUser]);
    authenticationMethodRepository.findByUserId
      .withArgs({ userId: targetUserId })
      .resolves([garAuthenticationMethodFromTargetUser]);

    // when
    await reassignAuthenticationMethodToAnotherUser({
      originUserId: originUserId,
      targetUserId: targetUserId,
      authenticationMethodId: poleEmploiAuthenticationMethodFromOriginUser.id,
      userRepository,
      authenticationMethodRepository,
    });

    // then
    expect(authenticationMethodRepository.updateAuthenticationMethodUserId).to.have.been.calledOnceWith({
      originUserId: originUserId,
      identityProvider: 'POLE_EMPLOI',
      targetUserId: targetUserId,
    });
  });
});
