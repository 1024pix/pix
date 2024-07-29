import { UserAnonymized } from '../../../../../lib/domain/events/UserAnonymized.js';
import { anonymizeUser } from '../../../../../lib/domain/usecases/anonymize-user.js';
import * as certificationCenterMembershipRepository from '../../../../../lib/infrastructure/repositories/certification-center-membership-repository.js';
import * as membershipRepository from '../../../../../lib/infrastructure/repositories/membership-repository.js';
import * as organizationLearnerRepository from '../../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import { refreshTokenService } from '../../../../../src/identity-access-management/domain/services/refresh-token-service.js';
import * as authenticationMethodRepository from '../../../../../src/identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import { resetPasswordDemandRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/reset-password-demand.repository.js';
import * as userRepository from '../../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { adminMemberRepository } from '../../../../../src/shared/infrastructure/repositories/admin-member.repository.js';
import * as userLoginRepository from '../../../../../src/shared/infrastructure/repositories/user-login-repository.js';
import { databaseBuilder, expect, knex, sinon } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | UseCase | anonymize-user', function () {
  let clock;
  const now = new Date('2003-04-05T03:04:05Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  it(`returns a UserAnonymized event,
    deletes all user’s authentication methods,
    revokes all user’s refresh tokens,
    removes all user’s password reset demands,
    disables all user’s organization memberships,
    disables all user’s certification center memberships,
    disables all user’s student prescriptions,
    anonymizes user login info
    and anonymizes user`, async function () {
    // given
    const user = databaseBuilder.factory.buildUser.withMembership({
      createdAt: new Date('2012-12-12T12:12:12Z'),
      updatedAt: new Date('2023-03-23T23:23:23Z'),
    });
    const userId = user.id;

    databaseBuilder.factory.buildCertificationCenterMembership({ userId });

    const managingStudentsOrga = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
    databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId: managingStudentsOrga.id });

    const userLogin = databaseBuilder.factory.buildUserLogin({
      userId,
      createdAt: new Date('2012-12-12T12:25:34Z'),
      updatedAt: new Date('2023-03-23T09:44:30Z'),
      lastLoggedAt: new Date('2023-02-18T18:18:02Z'),
      temporaryBlockedUntil: new Date('2023-03-23T08:16:16Z'),
      blockedAt: new Date('2023-03-23T09:44:30Z'),
    });

    const admin = databaseBuilder.factory.buildUser.withRole();
    const updatedByUserId = admin.id;

    await databaseBuilder.commit();

    const expectedUserAnonymizedEvent = new UserAnonymized({
      userId,
      updatedByUserId: admin.id,
      role: 'SUPER_ADMIN',
    });

    // when
    let result;
    await DomainTransaction.execute(async (domainTransaction) => {
      result = await anonymizeUser({
        updatedByUserId,
        userId,
        userRepository,
        userLoginRepository,
        authenticationMethodRepository,
        refreshTokenService,
        membershipRepository,
        certificationCenterMembershipRepository,
        organizationLearnerRepository,
        resetPasswordDemandRepository,
        domainTransaction,
        adminMemberRepository,
      });
    });

    // then
    expect(result).to.be.deep.equal(expectedUserAnonymizedEvent);

    const authenticationMethods = await knex('authentication-methods').where({ userId });
    expect(authenticationMethods).to.have.length(0);

    const refreshTokens = await refreshTokenService.userRefreshTokensTemporaryStorage.lrange(userId);
    expect(refreshTokens).to.have.length(0);

    const resetPasswordDemands = await knex('reset-password-demands').whereRaw('LOWER("email") = LOWER(?)', user.email);
    expect(resetPasswordDemands).to.have.length(0);

    const enabledMemberships = await knex('memberships').where({ userId }).whereNull('disabledAt');
    expect(enabledMemberships).to.have.length(0);
    const disabledMemberships = await knex('memberships').where({ userId }).whereNotNull('disabledAt');
    expect(disabledMemberships).to.have.length(1);

    const enabledCertificationCenterMemberships = await knex('certification-center-memberships')
      .where({ userId })
      .whereNull('disabledAt');
    expect(enabledCertificationCenterMemberships).to.have.length(0);
    const disabledCertificationCenterMemberships = await knex('certification-center-memberships')
      .where({ userId })
      .whereNotNull('disabledAt');
    expect(disabledCertificationCenterMemberships).to.have.length(1);

    const organizationLearners = await knex('organization-learners').where({ userId });
    expect(organizationLearners).to.have.length(0);

    const anonymizedUserLogin = await knex('user-logins').where({ id: userLogin.id }).first();
    expect(anonymizedUserLogin.createdAt.toISOString()).to.equal('2012-12-01T00:00:00.000Z');
    expect(anonymizedUserLogin.updatedAt.toISOString()).to.equal('2023-03-01T00:00:00.000Z');
    expect(anonymizedUserLogin.temporaryBlockedUntil).to.be.null;
    expect(anonymizedUserLogin.blockedAt).to.be.null;
    expect(anonymizedUserLogin.lastLoggedAt.toISOString()).to.equal('2023-02-01T00:00:00.000Z');

    const anonymizedUser = await knex('users').where({ id: user.id }).first();
    expect(anonymizedUser.createdAt.toISOString()).to.equal('2012-12-01T00:00:00.000Z');
    expect(anonymizedUser.updatedAt.toISOString()).to.equal('2023-03-01T00:00:00.000Z');
    expect(anonymizedUser.firstName).to.equal('(anonymised)');
    expect(anonymizedUser.lastName).to.equal('(anonymised)');
    expect(anonymizedUser.email).to.be.null;
    expect(anonymizedUser.emailConfirmedAt).to.be.null;
    expect(anonymizedUser.username).to.be.null;
    expect(anonymizedUser.hasBeenAnonymised).to.be.true;
    expect(anonymizedUser.hasBeenAnonymisedBy).to.equal(admin.id);
    expect(anonymizedUser.lastTermsOfServiceValidatedAt).to.be.null;
    expect(anonymizedUser.lastPixOrgaTermsOfServiceValidatedAt).to.be.null;
    expect(anonymizedUser.lastPixCertifTermsOfServiceValidatedAt).to.be.null;
    expect(anonymizedUser.lastDataProtectionPolicySeenAt).to.be.null;
  });
});
