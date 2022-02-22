const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const reassignAuthenticationMethodToAnotherUser = require('../../../../lib/domain/usecases/reassign-authentication-method-to-another-user');
const { AuthenticationMethodAlreadyExistsError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | reassign-authentication-method-to-another-user', function () {
  let authenticationMethodRepository;

  beforeEach(function () {
    authenticationMethodRepository = {
      getByIdAndUserId: sinon.stub(),
      updateAuthenticationMethodUserId: sinon.stub(),
      findByUserId: sinon.stub(),
    };
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

      authenticationMethodRepository.getByIdAndUserId
        .withArgs({ id: garAuthenticationMethodFromOriginUser.id, userId: originUserId })
        .resolves(garAuthenticationMethodFromOriginUser);
      authenticationMethodRepository.findByUserId
        .withArgs({ userId: targetUserId })
        .resolves([garAuthenticationMethodFromTargetUser, poleEmploiAuthenticationMethodFromTargetUser]);

      // when
      const error = await catchErr(reassignAuthenticationMethodToAnotherUser)({
        originUserId: originUserId,
        targetUserId: targetUserId,
        authenticationMethodId: garAuthenticationMethodFromOriginUser.id,
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

    authenticationMethodRepository.getByIdAndUserId
      .withArgs({ id: garAuthenticationMethodFromOriginUser.id, userId: originUserId })
      .resolves(garAuthenticationMethodFromOriginUser);
    authenticationMethodRepository.findByUserId
      .withArgs({ userId: targetUserId })
      .resolves([poleEmploiAuthenticationMethodFromTargetUser]);

    // when
    await reassignAuthenticationMethodToAnotherUser({
      originUserId: originUserId,
      targetUserId: targetUserId,
      authenticationMethodId: garAuthenticationMethodFromOriginUser.id,
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

    authenticationMethodRepository.getByIdAndUserId
      .withArgs({ id: poleEmploiAuthenticationMethodFromOriginUser.id, userId: originUserId })
      .resolves(poleEmploiAuthenticationMethodFromOriginUser);
    authenticationMethodRepository.findByUserId
      .withArgs({ userId: targetUserId })
      .resolves([garAuthenticationMethodFromTargetUser]);

    // when
    await reassignAuthenticationMethodToAnotherUser({
      originUserId: originUserId,
      targetUserId: targetUserId,
      authenticationMethodId: poleEmploiAuthenticationMethodFromOriginUser.id,
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
