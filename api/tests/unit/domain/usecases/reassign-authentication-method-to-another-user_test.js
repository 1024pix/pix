import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import reassignAuthenticationMethodToAnotherUser from '../../../../lib/domain/usecases/reassign-authentication-method-to-another-user';
import { AuthenticationMethodAlreadyExistsError, UserNotFoundError } from '../../../../lib/domain/errors';
import OidcIdentityProviders from '../../../../lib/domain/constants/oidc-identity-providers';

describe('Unit | UseCase | reassign-authentication-method-to-another-user', function () {
  let authenticationMethodRepository, userRepository;

  beforeEach(function () {
    authenticationMethodRepository = {
      getByIdAndUserId: sinon.stub(),
      updateAuthenticationMethodUserId: sinon.stub(),
      findByUserId: sinon.stub(),
    };
    userRepository = {
      get: sinon.stub(),
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
        originUserId,
        targetUserId,
        authenticationMethodId: garAuthenticationMethodFromOriginUser.id,
        userRepository,
        authenticationMethodRepository,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationMethodAlreadyExistsError);
      expect(error.message).to.equal("L'utilisateur 2 a déjà une méthode de connexion GAR.");
    });
  });

  context('When target user does not exists', function () {
    it('should throw an error', async function () {
      // given
      const originUserId = domainBuilder.buildUser({ id: 1 }).id;
      const garAuthenticationMethodFromOriginUser = domainBuilder.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: originUserId,
      });
      const nonExistingTargetUserId = originUserId + 1;
      const notFoundError = new UserNotFoundError();

      authenticationMethodRepository.getByIdAndUserId
        .withArgs({ id: garAuthenticationMethodFromOriginUser.id, userId: originUserId })
        .resolves(garAuthenticationMethodFromOriginUser);
      userRepository.get.withArgs(nonExistingTargetUserId).rejects(notFoundError);

      // when
      const error = await catchErr(reassignAuthenticationMethodToAnotherUser)({
        originUserId,
        targetUserId: nonExistingTargetUserId,
        authenticationMethodId: garAuthenticationMethodFromOriginUser.id,
        userRepository,
        authenticationMethodRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotFoundError);
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
      originUserId,
      targetUserId,
      authenticationMethodId: garAuthenticationMethodFromOriginUser.id,
      userRepository,
      authenticationMethodRepository,
    });

    // then
    expect(authenticationMethodRepository.updateAuthenticationMethodUserId).to.have.been.calledOnceWith({
      originUserId,
      identityProvider: 'GAR',
      targetUserId,
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
      originUserId,
      targetUserId,
      authenticationMethodId: poleEmploiAuthenticationMethodFromOriginUser.id,
      userRepository,
      authenticationMethodRepository,
    });

    // then
    expect(authenticationMethodRepository.updateAuthenticationMethodUserId).to.have.been.calledOnceWith({
      originUserId,
      identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code,
      targetUserId,
    });
  });
});
