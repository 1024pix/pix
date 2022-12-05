const { expect, sinon } = require('../../../test-helper');
const anonymizeUser = require('../../../../lib/domain/usecases/anonymize-user');

describe('Unit | UseCase | anonymize-user', function () {
  let clock;
  const now = new Date('2003-04-05T03:04:05Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers(now);
  });

  afterEach(function () {
    clock.restore();
  });

  it("deletes all authentication methods, revokes all user's refresh tokens, disables all user's organisation memberships, disables all user's certification center memberships and anonymize user", async function () {
    // given
    const userId = 1;
    const updatedByUserId = 2;
    const expectedAnonymizedUser = {
      firstName: `prenom_${userId}`,
      lastName: `nom_${userId}`,
      email: `email_${userId}@example.net`,
      username: null,
    };

    const userRepository = { updateUserDetailsForAdministration: sinon.stub() };
    const authenticationMethodRepository = { removeAllAuthenticationMethodsByUserId: sinon.stub() };
    const refreshTokenService = { revokeRefreshTokensForUserId: sinon.stub() };
    const membershipRepository = { disableMembershipsByUserId: sinon.stub() };
    const certificationCenterMembershipRepository = { disableMembershipsByUserId: sinon.stub() };

    // when
    await anonymizeUser({
      userId,
      userRepository,
      authenticationMethodRepository,
      refreshTokenService,
      membershipRepository,
      certificationCenterMembershipRepository,
      updatedByUserId,
    });

    // then
    expect(authenticationMethodRepository.removeAllAuthenticationMethodsByUserId).to.have.been.calledWithExactly({
      userId,
    });
    expect(refreshTokenService.revokeRefreshTokensForUserId).to.have.been.calledWithExactly({ userId });
    expect(membershipRepository.disableMembershipsByUserId).to.have.been.calledWith({
      userId,
      updatedByUserId,
    });
    expect(certificationCenterMembershipRepository.disableMembershipsByUserId).to.have.been.calledWith({
      updatedByUserId,
      userId,
    });
    expect(userRepository.updateUserDetailsForAdministration).to.have.been.calledWithExactly(
      userId,
      expectedAnonymizedUser
    );
  });
});
