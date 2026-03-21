import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { RefreshToken } from '../../../../../src/identity-access-management/domain/models/RefreshToken.js';
import { refreshTokenRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/refresh-token.repository.js';
import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';
import { usecases } from '../../../../../src/privacy/domain/usecases/index.js';
import { UserNotFoundError } from '../../../../../src/shared/domain/errors.js';
import { AuditLoggingJob } from '../../../../../src/shared/domain/models/jobs/AuditLoggingJob.js';
import { databaseBuilder, expect, knex, sinon } from '../../../../test-helper.js';

const { PIX_ORGA } = LegalDocumentService.VALUES;
const { TOS } = LegalDocumentType.VALUES;

describe('Integration | Privacy | Domain | UseCase | anonymize-user', function () {
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
    anonymizes user’s legal document acceptances,
    anonymizes user login info,
    anonymizes last user application connections lastLoggedAt,
    anonymizes membership lastAccessedAt,
    anonymizes certification center membership lastAccessedAt,
    and anonymizes user`, async function () {
    // given

    const user = databaseBuilder.factory.buildUser({
      createdAt: new Date('2012-12-12T12:12:12Z'),
      updatedAt: new Date('2023-03-23T23:23:23Z'),
    });

    databaseBuilder.factory.buildMembership({
      userId: user.id,
      lastAccessedAt: new Date('2023-03-23T23:23:23Z'),
    });

    const admin = databaseBuilder.factory.buildUser.withRole();

    const userId = user.id;
    const anonymizedByUserId = admin.id;

    databaseBuilder.factory.buildCertificationCenterMembership({
      userId,
      lastAccessedAt: new Date('2023-03-23T23:23:23Z'),
    });

    databaseBuilder.factory.buildLastUserApplicationConnection({
      userId,
      application: 'orga',
      lastLoggedAt: new Date('2023-03-23T23:23:23Z'),
    });

    const managingStudentsOrga = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
    databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId: managingStudentsOrga.id });

    const legalDocumentVersion = databaseBuilder.factory.buildLegalDocumentVersion({ service: PIX_ORGA, type: TOS });
    databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
      userId: user.id,
      legalDocumentVersionId: legalDocumentVersion.id,
      acceptedAt: new Date('2023-03-23T23:23:23Z'),
    }).id;

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
      anonymizedByUserId,
      anonymizedByUserRole: PIX_ADMIN.ROLES.SUPER_ADMIN,
      client: 'PIX_ADMIN',
    });

    // then
    await expect(AuditLoggingJob.name).to.have.been.performed.withJobPayload({
      client: 'PIX_ADMIN',
      action: 'ANONYMIZATION',
      role: PIX_ADMIN.ROLES.SUPER_ADMIN,
      occurredAt: now.toISOString(),
      userId: anonymizedByUserId,
      targetUserIds: [userId],
      correlationContext: {
        user_id: null,
      },
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
    expect(disabledMemberships[0].lastAccessedAt.toISOString()).to.equal('2023-03-01T00:00:00.000Z');

    const enabledCertificationCenterMemberships = await knex('certification-center-memberships')
      .where({ userId })
      .whereNull('disabledAt');
    expect(enabledCertificationCenterMemberships).to.have.lengthOf(0);
    const disabledCertificationCenterMemberships = await knex('certification-center-memberships')
      .where({ userId })
      .whereNotNull('disabledAt');
    expect(disabledCertificationCenterMemberships).to.have.lengthOf(1);
    expect(disabledCertificationCenterMemberships[0].lastAccessedAt.toISOString()).to.equal('2023-03-01T00:00:00.000Z');

    const organizationLearners = await knex('organization-learners').where({ userId });
    expect(organizationLearners).to.have.lengthOf(0);

    const userAcceptance = await knex('legal-document-version-user-acceptances').where({ userId: user.id }).first();
    expect(userAcceptance).to.be.undefined;

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

    const lastUserApplicationConnection = await knex('last-user-application-connections').where({ userId }).first();
    expect(lastUserApplicationConnection.lastLoggedAt.toISOString()).to.equal('2023-03-01T00:00:00.000Z');
  });

  it('should anonymized user linked learner', async function () {
    const user = databaseBuilder.factory.buildUser({
      createdAt: new Date('2012-12-12T12:12:12Z'),
      updatedAt: new Date('2023-03-23T23:23:23Z'),
    });
    const admin = databaseBuilder.factory.buildUser.withRole();
    const userId = user.id;
    const anonymizedByUserId = admin.id;

    databaseBuilder.factory.buildMembership({
      userId,
      lastAccessedAt: new Date('2023-03-23T23:23:23Z'),
    });

    const managingStudentsOrga = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
    const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
      userId,
      firstName: 'Jacqueline',
      lastName: 'Colson',
      email: 'jaquelinecolson@presque.fr',
      organizationId: managingStudentsOrga.id,
    });
    const campaign = databaseBuilder.factory.buildCampaign({ organizationId: managingStudentsOrga.id });

    databaseBuilder.factory.buildCampaignParticipation({
      userId,
      participantExternalId: 'jaquelinecolson',
      campaignId: campaign.id,
      organizationLearnerId: organizationLearner.id,
    });
    await databaseBuilder.commit();

    // when
    await usecases.anonymizeUser({
      userId,
      anonymizedByUserId,
      anonymizedByUserRole: PIX_ADMIN.ROLES.SUPER_ADMIN,
      client: 'PIX_ADMIN',
    });

    // then
    const organizationLearners = await knex('organization-learners').where({ userId });
    expect(organizationLearners).to.have.lengthOf(0);

    const participations = await knex('campaign-participations').where({ userId });
    expect(participations).lengthOf(0);
  });

  context('when anonymizedByUserId does not exist', function () {
    it('throws an error and does not anonymize the user', async function () {
      // given
      const user = databaseBuilder.factory.buildUser({ firstName: 'Bob' });
      await databaseBuilder.commit();

      // when / then
      await expect(
        usecases.anonymizeUser({
          userId: user.id,
          anonymizedByUserId: 666,
          anonymizedByUserRole: PIX_ADMIN.ROLES.SUPER_ADMIN,
          client: 'PIX_ADMIN',
        }),
      ).to.be.rejectedWith(UserNotFoundError, 'User not found for ID 666');

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
        anonymizedByUserId: newAdmin.id,
        anonymizedByUserRole: PIX_ADMIN.ROLES.SUPER_ADMIN,
        client: 'PIX_ADMIN',
      });

      // then
      const anonymizedUser = await knex('users').where({ id: user.id }).first();
      expect(anonymizedUser.firstName).to.equal('(anonymised)');
      expect(anonymizedUser.hasBeenAnonymised).to.be.true;
      expect(anonymizedUser.hasBeenAnonymisedBy).to.equal(newAdmin.id);
    });
  });
});
