import { expect, sinon } from '../../../test-helper';
import anonymizeUser from '../../../../lib/domain/usecases/anonymize-user';
import DomainTransaction from '../../../../lib/infrastructure/DomainTransaction';

describe('Unit | UseCase | anonymize-user', function () {
  let clock;
  const now = new Date('2003-04-05T03:04:05Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers(now);
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

    const domainTransaction = {
      knexTransaction: Symbol('transaction'),
    };
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback(domainTransaction);
    });

    const userRepository = { updateUserDetailsForAdministration: sinon.stub(), getUserDetailsForAdmin: sinon.stub() };
    userRepository.getUserDetailsForAdmin.withArgs(userId).resolves(expectedAnonymizedUser);

    const authenticationMethodRepository = { removeAllAuthenticationMethodsByUserId: sinon.stub() };
    const refreshTokenService = { revokeRefreshTokensForUserId: sinon.stub() };
    const membershipRepository = { disableMembershipsByUserId: sinon.stub() };
    const certificationCenterMembershipRepository = { disableMembershipsByUserId: sinon.stub() };
    const organizationLearnerRepository = { dissociateAllStudentsByUserId: sinon.stub() };

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
    });

    // then
    expect(result).to.be.equal(expectedAnonymizedUser);

    expect(authenticationMethodRepository.removeAllAuthenticationMethodsByUserId).to.have.been.calledWithExactly({
      userId,
      domainTransaction,
    });
    expect(refreshTokenService.revokeRefreshTokensForUserId).to.have.been.calledWithExactly({ userId });
    expect(membershipRepository.disableMembershipsByUserId).to.have.been.calledWith({
      userId,
      updatedByUserId,
      domainTransaction,
    });
    expect(certificationCenterMembershipRepository.disableMembershipsByUserId).to.have.been.calledWith({
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
  });
});
