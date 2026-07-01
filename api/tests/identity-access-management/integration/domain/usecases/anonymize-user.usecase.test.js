import sinon from 'sinon';

import { RefreshToken } from '../../../../../src/identity-access-management/domain/models/RefreshToken.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { refreshTokenRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/refresh-token.repository.js';
import { PIX_ADMIN } from '../../../../../src/shared/constants.js';
import { UserNotFoundError } from '../../../../../src/shared/domain/errors.js';
import { AuditLoggingJob } from '../../../../../src/shared/domain/models/jobs/AuditLoggingJob.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../src/shared/infrastructure/execution-context-manager.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Domain | UseCase | anonymize-user', function () {
  let clock;
  const now = new Date('2024-04-05T03:04:05Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  it(`deletes all user’s authentication methods,
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

    const admin = databaseBuilder.factory.buildUser.withRole();

    const userId = user.id;
    const anonymizedByUserId = admin.id;

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

    await databaseBuilder.commit();

    const refreshToken = RefreshToken.generate({ userId, source: 'pix' });
    await refreshTokenRepository.save({ refreshToken });

    // when
    await usecases.anonymizeUser({
      userId,
      updatedByUserId: anonymizedByUserId,
    });

    // then
    await expect(AuditLoggingJob.name).to.have.been.performed.withJobPayload({
      client: 'PIX_ADMIN',
      action: 'ANONYMIZATION',
      role: PIX_ADMIN.ROLES.SUPER_ADMIN,
      occurredAt: now.toISOString(),
      userId: anonymizedByUserId,
      targetUserIds: [userId],
      correlationContext: EMPTY_CORRELATION_INFO,
    });

    const authenticationMethods = await knex('authentication-methods').where({ userId });
    expect(authenticationMethods).to.have.lengthOf(0);

    const refreshTokens = await refreshTokenRepository.findAllByUserId(userId);
    expect(refreshTokens).to.have.lengthOf(0);

    const resetPasswordDemands = await knex('reset-password-demands').whereRaw('LOWER("email") = LOWER(?)', user.email);
    expect(resetPasswordDemands).to.have.lengthOf(0);

    const enabledMemberships = await knex('memberships').where({ userId }).whereNull('disabledAt');
    expect(enabledMemberships).to.have.lengthOf(0);
    const disabledMemberships = await knex('memberships').where({ userId }).whereNotNull('disabledAt');
    expect(disabledMemberships).to.have.lengthOf(1);

    const enabledCertificationCenterMemberships = await knex('certification-center-memberships')
      .where({ userId })
      .whereNull('disabledAt');
    expect(enabledCertificationCenterMemberships).to.have.lengthOf(0);
    const disabledCertificationCenterMemberships = await knex('certification-center-memberships')
      .where({ userId })
      .whereNotNull('disabledAt');
    expect(disabledCertificationCenterMemberships).to.have.lengthOf(1);

    const organizationLearners = await knex('organization-learners').where({ userId });
    expect(organizationLearners).to.have.lengthOf(0);

    const anonymizedUserLogin = await knex('user-logins').where({ id: userLogin.id }).first();
    expect(anonymizedUserLogin.createdAt.toISOString()).to.equal('2012-12-01T00:00:00.000Z');
    expect(anonymizedUserLogin.updatedAt.toISOString()).to.equal('2023-03-01T00:00:00.000Z');
    expect(anonymizedUserLogin.temporaryBlockedUntil).to.be.null;
    expect(anonymizedUserLogin.blockedAt).to.be.null;
    expect(anonymizedUserLogin.lastLoggedAt.toISOString()).to.equal('2023-02-01T00:00:00.000Z');

    const anonymizedUser = await knex('users').where({ id: user.id }).first();
    expect(anonymizedUser.createdAt.toISOString()).to.equal('2012-12-01T00:00:00.000Z');
    expect(anonymizedUser.updatedAt.toISOString()).to.equal('2024-04-01T00:00:00.000Z');
    expect(anonymizedUser.firstName).to.equal('(anonymised)');
    expect(anonymizedUser.lastName).to.equal('(anonymised)');
    expect(anonymizedUser.email).to.be.null;
    expect(anonymizedUser.emailConfirmedAt).to.be.null;
    expect(anonymizedUser.username).to.be.null;
    expect(anonymizedUser.hasBeenAnonymised).to.be.true;
    expect(anonymizedUser.hasBeenAnonymisedBy).to.equal(admin.id);
    expect(anonymizedUser.lastTermsOfServiceValidatedAt).to.be.null;
    expect(anonymizedUser.lastPixCertifTermsOfServiceValidatedAt).to.be.null;
    expect(anonymizedUser.lastDataProtectionPolicySeenAt).to.be.null;
  });

  context('when the admin user does not exist', function () {
    it('throws an error and does not anonymize the user', async function () {
      // given
      const user = databaseBuilder.factory.buildUser({ firstName: 'Bob' });
      await databaseBuilder.commit();

      // when / then
      await expect(
        usecases.anonymizeUser({
          userId: user.id,
          updatedByUserId: 666,
        }),
      ).to.be.rejectedWith(UserNotFoundError, 'Admin not found for id: 666');

      const anonymizedUser = await knex('users').where({ id: user.id }).first();
      expect(anonymizedUser.hasBeenAnonymised).to.be.false;
    });
  });

  context('when user has been already anonymized', function () {
    it('anonymizes and overrides the original admin which has anonymized the user', async function () {
      // given
      const originalAdmin = databaseBuilder.factory.buildUser.withRole();
      const newAdmin = databaseBuilder.factory.buildUser.withRole();
      const user = databaseBuilder.factory.buildUser({
        firstName: 'Bob',
        hasBeenAnonymised: true,
        hasBeenAnonymisedBy: originalAdmin.id,
      });
      await databaseBuilder.commit();

      // when
      await usecases.anonymizeUser({
        userId: user.id,
        updatedByUserId: newAdmin.id,
      });

      // then
      const anonymizedUser = await knex('users').where({ id: user.id }).first();
      expect(anonymizedUser.firstName).to.equal('(anonymised)');
      expect(anonymizedUser.hasBeenAnonymised).to.be.true;
      expect(anonymizedUser.hasBeenAnonymisedBy).to.equal(newAdmin.id);
    });
  });
});
