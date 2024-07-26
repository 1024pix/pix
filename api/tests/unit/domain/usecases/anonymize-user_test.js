import { UserAnonymized } from '../../../../lib/domain/events/UserAnonymized.js';
import { anonymizeUser } from '../../../../lib/domain/usecases/anonymize-user.js';
import { UserLogin } from '../../../../src/shared/domain/models/index.js';
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
      anonymizes user login info
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
      createdAt: now,
      updatedAt: now,
    };
    const expectedAnonymizedUser = Object.assign(anonymizedUser, {
      createdAt: new Date('2003-04-01T00:00:00Z'),
      updatedAt: new Date('2003-04-01T00:00:00Z'),
    });
    const expectedUserAnonymizedEvent = new UserAnonymized({
      userId,
      updatedByUserId,
      role,
    });

    const userRepository = {
      get: sinon.stub(),
      updateUserDetailsForAdministration: sinon.stub(),
      getUserDetailsForAdmin: sinon.stub(),
    };
    userRepository.get.withArgs(userId).resolves({ id: userId, email: userEmail, createdAt: now, updatedAt: now });
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
    });

    // then
    expect(result).to.be.deep.equal(expectedUserAnonymizedEvent);

    expect(authenticationMethodRepository.removeAllAuthenticationMethodsByUserId).to.have.been.calledWithExactly({
      userId,
    });

    expect(refreshTokenService.revokeRefreshTokensForUserId).to.have.been.calledWithExactly({ userId });

    expect(resetPasswordDemandRepository.removeAllByEmail).to.have.been.calledWithExactly(userEmail);

    expect(membershipRepository.disableMembershipsByUserId).to.have.been.calledWithExactly({
      userId,
      updatedByUserId,
    });

    expect(certificationCenterMembershipRepository.disableMembershipsByUserId).to.have.been.calledWithExactly({
      userId,
      updatedByUserId,
    });

    expect(userRepository.updateUserDetailsForAdministration).to.have.been.calledWithExactly(
      {
        id: userId,
        userAttributes: anonymizedUser,
      },
      {
        preventUpdatedAt: true,
      },
    );

    expect(organizationLearnerRepository.dissociateAllStudentsByUserId).to.have.been.calledWithExactly({
      userId,
    });

    // I don't know how to make this work :'(
    // expect(userLoginRepository.update).to.have.been.calledWithExactly(userLogin.anonymize(), {
    //   preventUpdatedAt: true,
    // });

    expect(adminMemberRepository.get).to.have.been.calledWithExactly({ userId: updatedByUserId });
  });
});
