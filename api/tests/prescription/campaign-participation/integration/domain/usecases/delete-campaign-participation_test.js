import { USER_RECOMMENDED_TRAININGS_TABLE_NAME } from '../../../../../../db/migrations/20221017085933_create-user-recommended-trainings.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { CampaignParticipationLoggerContext } from '../../../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { AuditLoggingJob } from '../../../../../../src/shared/domain/models/jobs/AuditLoggingJob.js';
import { databaseBuilder, expect, knex, sinon } from '../../../../../test-helper.js';

const {
  buildAssessment,
  buildTargetProfile,
  buildBadge,
  buildUser,
  buildCampaignParticipation,
  buildUserRecommendedTraining,
  buildCampaign,
  buildBadgeAcquisition,
} = databaseBuilder.factory;

describe('Integration | UseCases | delete-campaign-participation', function () {
  let clock, now;
  let adminUserId;
  let campaignId;
  let userId;
  let campaignParticipationId;
  let organizationLearnerId;
  let targetProfileId;

  beforeEach(async function () {
    now = new Date('2023-03-03');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

    adminUserId = databaseBuilder.factory.buildUser().id;
    userId = databaseBuilder.factory.buildUser().id;
    targetProfileId = buildTargetProfile().id;
    campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
    organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ userId }).id;
    campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
      isImproved: false,
      organizationLearnerId,
      userId,
      deletedAt: null,
      deletedBy: null,
      participantExternalId: 'email olala',
      campaignId,
    }).id;

    await databaseBuilder.commit();
  });

  afterEach(function () {
    clock.restore();
  });

  it('should delete all campaignParticipations with anonymization', async function () {
    // given

    databaseBuilder.factory.buildCampaignParticipation({
      isImproved: true,
      participantExternalId: 'email olala',
      organizationLearnerId,
      userId,
      deletedAt: null,
      deletedBy: null,
      campaignId,
    });

    await databaseBuilder.commit();

    // when
    await usecases.deleteCampaignParticipation({
      userId: adminUserId,
      campaignId,
      campaignParticipationId,
      userRole: 'ORGA_ADMIN',
      client: 'PIX_ORGA',
    });

    // then
    const results = await knex('campaign-participations').where({ organizationLearnerId });

    expect(results).to.have.lengthOf(2);
    results.forEach((campaignParticipaton) => {
      expect(campaignParticipaton.userId).to.equal(null);
      expect(campaignParticipaton.participantExternalId).to.equal(null);
      expect(campaignParticipaton.deletedAt).to.deep.equal(now);
      expect(campaignParticipaton.deletedBy).to.equal(adminUserId);
    });
  });

  it('should update deleted campaignParticipations only with anonymization', async function () {
    // given

    const deletedParticipation = databaseBuilder.factory.buildCampaignParticipation({
      isImproved: true,
      participantExternalId: 'email olala',
      organizationLearnerId,
      userId,
      deletedAt: new Date('2024-01-01'),
      deletedBy: databaseBuilder.factory.buildUser().id,
      campaignId,
    });

    await databaseBuilder.commit();

    // when
    await usecases.deleteCampaignParticipation({
      userId: adminUserId,
      campaignId,
      campaignParticipationId,
      userRole: 'ORGA_ADMIN',
      client: 'PIX_ORGA',
      keepPreviousDeleted: true,
    });

    // then
    const results = await knex('campaign-participations')
      .select('userId', 'participantExternalId', 'deletedAt', 'deletedBy')
      .where({ organizationLearnerId });

    expect(results).to.have.lengthOf(2);
    expect(results).deep.members([
      { userId, participantExternalId: 'email olala', deletedAt: null, deletedBy: null },
      {
        userId: null,
        participantExternalId: null,
        deletedAt: deletedParticipation.deletedAt,
        deletedBy: deletedParticipation.deletedBy,
      },
    ]);
  });

  it('should publish an event to historize action', async function () {
    // when
    await usecases.deleteCampaignParticipation({
      userId: adminUserId,
      campaignId,
      campaignParticipationId,
      userRole: 'ORGA_ADMIN',
      client: 'PIX_ORGA',
    });

    // then
    await expect(AuditLoggingJob.name).to.have.been.performed.withJobPayload({
      client: 'PIX_ORGA',
      action: CampaignParticipationLoggerContext.DELETION,
      role: 'ORGA_ADMIN',
      userId: adminUserId,
      occurredAt: now.toISOString(),
      targetUserIds: [campaignParticipationId],
      data: {},
      correlationContext: {
        user_id: null,
      },
    });
  });

  context('when there are badges linked to the campaign participations', function () {
    let badgesAcquisitions;
    let certifiableBadge;
    let nonCertifiableBadge;

    beforeEach(async function () {
      // given
      nonCertifiableBadge = buildBadge({
        targetProfileId,
        isCertifiable: false,
      });
      certifiableBadge = buildBadge({
        targetProfileId,
        isCertifiable: true,
      });

      buildBadgeAcquisition({
        badgeId: certifiableBadge.id,
        campaignParticipationId,
        userId,
      });
      buildBadgeAcquisition({
        badgeId: nonCertifiableBadge.id,
        campaignParticipationId,
        userId,
      });

      await databaseBuilder.commit();
    });

    it('should delete userId on non certifiable badgesAcquisitions', async function () {
      // when
      await usecases.deleteCampaignParticipation({
        userId: adminUserId,
        campaignId,
        campaignParticipationId,
        userRole: 'ORGA_ADMIN',
        client: 'PIX_ORGA',
      });

      // then
      badgesAcquisitions = await knex('badge-acquisitions').where({
        campaignParticipationId,
      });
      const nonCertifiableBadgeAcquisition = badgesAcquisitions.find(
        (badgeAcquisition) => badgeAcquisition.badgeId === nonCertifiableBadge.id,
      );
      expect(nonCertifiableBadgeAcquisition.userId).to.be.null;
    });

    it('should not delete userId on certifiable badgesAcquisitions', async function () {
      // when
      await usecases.deleteCampaignParticipation({
        userId: adminUserId,
        campaignId,
        campaignParticipationId,
        userRole: 'ORGA_ADMIN',
        client: 'PIX_ORGA',
      });

      // then
      badgesAcquisitions = await knex('badge-acquisitions').where({
        campaignParticipationId,
      });

      const certifiableBadgeAcquisition = badgesAcquisitions.find(
        (badgeAcquisition) => badgeAcquisition.badgeId === certifiableBadge.id,
      );
      expect(certifiableBadgeAcquisition.userId).to.equal(userId);
    });
  });

  context('when there is assessment linked to campaign participation', function () {
    it('should detach assessments', async function () {
      // given
      const assessment1 = buildAssessment({ userId, campaignParticipationId, type: Assessment.types.CAMPAIGN });

      const assessment2 = buildAssessment({
        userId,
        campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
        isImproving: true,
      });
      const otherCampaignParticipationId = buildCampaignParticipation({
        organizationLearnerId,
        userId,
      }).id;
      const otherAssessment = buildAssessment({
        userId,
        campaignParticipationId: otherCampaignParticipationId,
        type: Assessment.types.CAMPAIGN,
        isImproving: true,
      });
      await databaseBuilder.commit();

      // when
      await usecases.deleteCampaignParticipation({
        userId: adminUserId,
        campaignId,
        campaignParticipationId,
        userRole: 'ORGA_ADMIN',
        client: 'PIX_ORGA',
      });

      // then
      const assessmentsInDb = await knex('assessments').whereIn('id', [assessment1.id, assessment2.id]);
      assessmentsInDb.forEach((assessment) => {
        expect(assessment.campaignParticipationId).null;
      });
      const otherAssessmentsInDb = await knex('assessments').where('id', otherAssessment.id).first();
      expect(otherAssessmentsInDb.campaignParticipationId).equal(otherAssessment.campaignParticipationId);
    });
  });

  context('when there are user-recommended-trainings linked to campaign participations', function () {
    let adminUserId, campaignParticipationId, userId, userRecommendedTrainingId, campaignId;

    beforeEach(async function () {
      //given
      adminUserId = buildUser().id;
      userId = buildUser().id;
      campaignId = buildCampaign().id;
      campaignParticipationId = buildCampaignParticipation({ userId, campaignId }).id;
      userRecommendedTrainingId = buildUserRecommendedTraining({ userId, campaignParticipationId }).id;

      await databaseBuilder.commit();
    });

    it('should delete campaignParticipationId', async function () {
      //when
      await usecases.deleteCampaignParticipation({
        userId: adminUserId,
        campaignId,
        campaignParticipationId,
        userRole: 'ORGA_ADMIN',
        client: 'PIX_ORGA',
      });

      //then
      const userRecommendedTrainingAnonymized = await knex(USER_RECOMMENDED_TRAININGS_TABLE_NAME)
        .where('id', userRecommendedTrainingId)
        .first();

      expect(userRecommendedTrainingAnonymized.campaignParticipationId).to.be.null;
    });
  });
});
