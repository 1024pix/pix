import { expect, sinon } from '../../../test-helper.js';
import { anonymizeUser } from '../../../../lib/domain/usecases/anonymize-user.js';
import { UserAnonymized } from '../../../../lib/domain/events/UserAnonymized.js';

describe('Unit | UseCase | anonymize-user', function () {
  let clock;
  const now = new Date('2003-04-05T03:04:05Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  it(`deletes all authentication methods,
      revokes all user's refresh tokens,
      disables all user's organisation memberships,
      disables all user's certification center memberships,
      disables all user's student prescriptions,
      and anonymize user`, async function () {
    // given
    const userId = 1;
    const updatedByUserId = 2;
    const role = 'SUPER_ADMIN';
    const anonymizedUser = {
      firstName: `prenom_${userId}`,
      lastName: `nom_${userId}`,
      email: `email_${userId}@example.net`,
      username: null,
      hasBeenAnonymised: true,
      hasBeenAnonymisedBy: 2,
      updatedAt: now,
    };
    const expectedAnonymizedUser = Symbol('anonymized user');
    const expectedUserAnonymizedEvent = new UserAnonymized({
      userId,
      updatedByUserId,
      role,
    });

    const domainTransaction = {
      knexTransaction: Symbol('transaction'),
    };

    const userRepository = { updateUserDetailsForAdministration: sinon.stub(), getUserDetailsForAdmin: sinon.stub() };
    userRepository.getUserDetailsForAdmin.withArgs(userId).resolves(expectedAnonymizedUser);

    const authenticationMethodRepository = { removeAllAuthenticationMethodsByUserId: sinon.stub() };
    const refreshTokenService = { revokeRefreshTokensForUserId: sinon.stub() };
    const membershipRepository = { disableMembershipsByUserId: sinon.stub() };
    const certificationCenterMembershipRepository = { disableMembershipsByUserId: sinon.stub() };
    const organizationLearnerRepository = { dissociateAllStudentsByUserId: sinon.stub() };
    const adminMemberRepository = { get: sinon.stub().resolves({ role }) };

    // when
    const result = await anonymizeUser({
      updatedByUserId,
      userId,
      userRepository,
      authenticationMethodRepository,
      refreshTokenService,
      membershipRepository,
      certificationCenterMembershipRepository,
      organizationLearnerRepository,
      domainTransaction,
      adminMemberRepository,
    });

    // then
    expect(result).to.be.deep.equal(expectedUserAnonymizedEvent);

    expect(authenticationMethodRepository.removeAllAuthenticationMethodsByUserId).to.have.been.calledWithExactly({
      userId,
      domainTransaction,
    });
    expect(refreshTokenService.revokeRefreshTokensForUserId).to.have.been.calledWithExactly({ userId });
    expect(membershipRepository.disableMembershipsByUserId).to.have.been.calledWithExactly({
      userId,
      updatedByUserId,
      domainTransaction,
    });
    expect(certificationCenterMembershipRepository.disableMembershipsByUserId).to.have.been.calledWithExactly({
      updatedByUserId,
      userId,
      domainTransaction,
    });
    expect(userRepository.updateUserDetailsForAdministration).to.have.been.calledWithExactly({
      id: userId,
      userAttributes: anonymizedUser,
      domainTransaction,
    });
    expect(organizationLearnerRepository.dissociateAllStudentsByUserId).to.have.been.calledWithExactly({
      userId,
      domainTransaction,
    });
    expect(adminMemberRepository.get).to.have.been.calledWithExactly({ userId: updatedByUserId });
  });
});
