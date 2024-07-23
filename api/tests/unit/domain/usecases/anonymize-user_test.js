import { UserAnonymized } from '../../../../lib/domain/events/UserAnonymized.js';
import { UserLogin } from '../../../../lib/domain/models/index.js';
import { anonymizeUser } from '../../../../lib/domain/usecases/anonymize-user.js';
import { expect, sinon } from '../../../test-helper.js';

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
      removes all user's password reset demands,
      disables all user's organisation memberships,
      disables all user's certification center memberships,
      disables all user's student prescriptions,
      anonimizes user login info
      and anonymizes user`, async function () {
    // given
    const userId = 1;
    const userEmail = 'user@example.com';
    const updatedByUserId = 2;
    const role = 'SUPER_ADMIN';
    const anonymizedUser = {
      firstName: '(anonymised)',
      lastName: '(anonymised)',
      email: null,
      emailConfirmedAt: null,
      username: null,
      hasBeenAnonymised: true,
      hasBeenAnonymisedBy: 2,
      lastTermsOfServiceValidatedAt: null,
      lastPixOrgaTermsOfServiceValidatedAt: null,
      lastPixCertifTermsOfServiceValidatedAt: null,
      lastDataProtectionPolicySeenAt: null,
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

    const userRepository = {
      get: sinon.stub(),
      updateUserDetailsForAdministration: sinon.stub(),
      getUserDetailsForAdmin: sinon.stub(),
    };
    userRepository.get.withArgs(userId).resolves({ id: userId, email: userEmail });
    userRepository.getUserDetailsForAdmin.withArgs(userId).resolves(expectedAnonymizedUser);

    const userLogin = new UserLogin();
    const userLoginRepository = { findByUserId: sinon.stub(), update: sinon.stub() };
    userLoginRepository.findByUserId.withArgs(userId).resolves(userLogin);

    const authenticationMethodRepository = { removeAllAuthenticationMethodsByUserId: sinon.stub() };
    const refreshTokenService = { revokeRefreshTokensForUserId: sinon.stub() };
    const resetPasswordDemandRepository = { removeAllByEmail: sinon.stub() };
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
      resetPasswordDemandRepository,
      adminMemberRepository,
      userLoginRepository,
      domainTransaction,
    });

    // then
    expect(result).to.be.deep.equal(expectedUserAnonymizedEvent);

    expect(authenticationMethodRepository.removeAllAuthenticationMethodsByUserId).to.have.been.calledWithExactly({
      userId,
      domainTransaction,
    });

    expect(refreshTokenService.revokeRefreshTokensForUserId).to.have.been.calledWithExactly({ userId });

    expect(resetPasswordDemandRepository.removeAllByEmail).to.have.been.calledWithExactly(userEmail);

    expect(membershipRepository.disableMembershipsByUserId).to.have.been.calledWithExactly({
      userId,
      updatedByUserId,
      domainTransaction,
    });

    expect(certificationCenterMembershipRepository.disableMembershipsByUserId).to.have.been.calledWithExactly({
      userId,
      updatedByUserId,
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

    expect(userLoginRepository.update).to.have.been.calledWith(userLogin.anonymize());

    expect(adminMemberRepository.get).to.have.been.calledWithExactly({ userId: updatedByUserId });
  });
});
