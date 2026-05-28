import sinon from 'sinon';

import { USER_RECOMMENDED_TRAININGS_TABLE_NAME } from '../../../../../../db/migrations/20221017085933_create-user-recommended-trainings.js';
import { ANONYMIZATION_RULE } from '../../../../../../src/prescription/learner-management/domain/constants.js';
import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import {
  CampaignParticipationLoggerContext,
  CampaignTypes,
  OrganizationLearnerLoggerContext,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { CLIENTS, PIX_ORGA } from '../../../../../../src/shared/domain/constants.js';
import { ORGANIZATION_FEATURE } from '../../../../../../src/shared/domain/constants.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { AuditLoggingJob } from '../../../../../../src/shared/domain/models/jobs/AuditLoggingJob.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';

const {
  buildMembership,
  buildOrganization,
  buildCampaign,
  buildCampaignParticipation,
  buildUser,
  buildBadge,
  buildAssessment,
  buildBadgeAcquisition,
  buildOrganizationLearner,
  buildUserRecommendedTraining,
} = databaseBuilder.factory;

describe('Integration | UseCase | Organization Learners Management | Delete Organization Learners', function () {
  let organizationId;
  let campaign;
  let organizationLearner1, organizationLearner2;
  let campaignParticipation1;
  const participantExternalId = 'foo';
  let adminUserId;
  let now, clock;

  beforeEach(async function () {
    adminUserId = buildUser().id;
    organizationId = buildOrganization().id;
    campaign = buildCampaign({ organizationId, type: CampaignTypes.ASSESSMENT });
    organizationLearner1 = buildOrganizationLearner({
      organizationId,
      firstName: 'POUET',
      birthdate: '2020-05-12',
    });
    organizationLearner2 = buildOrganizationLearner({
      organizationId,
      firstName: 'TEUOP',
      birthdate: '2020-12-12',
    });
    campaignParticipation1 = buildCampaignParticipation({
      organizationLearnerId: organizationLearner1.id,
      participantExternalId,
      userId: organizationLearner1.userId,
    });

    await databaseBuilder.commit();

    now = new Date('2023-03-03');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('when no organization learner is provided', function () {
    it('should do nothing', async function () {
      await expect(
        usecases.deleteOrganizationLearners({
          organizationLearnerIds: [],
        }),
      ).to.be.fulfilled;
    });
  });

  it('should delete and anonymize learner and all theirs campaignParticipations', async function () {
    // given
    buildCampaignParticipation({
      organizationLearnerId: organizationLearner1.id,
      participantExternalId,
      isImproved: true,
      userId: organizationLearner1.userId,
    });

    const otherLearner = buildOrganizationLearner();
    const otherParticipation = buildCampaignParticipation({
      organizationLearnerId: otherLearner.id,
      participantExternalId,
      userId: otherLearner.userId,
    });
    await databaseBuilder.commit();

    // when
    await usecases.deleteOrganizationLearners({
      userId: adminUserId,
      organizationLearnerIds: [organizationLearner1.id, organizationLearner2.id],
      organizationId,
      userRole: 'ORGA_ADMIN',
      client: 'PIX_ORGA',
    });

    // then
    const deletedLearners = await knex('organization-learners').where({ organizationId });
    expect(deletedLearners).lengthOf(2);
    deletedLearners.forEach((learner) => {
      expect(learner.firstName).to.equal('(anonymized)');
      expect(learner.lastName).to.equal('(anonymized)');
      expect(learner.preferredLastName).null;
      expect(learner.middleName).null;
      expect(learner.thirdName).null;
      expect(learner.birthdate).equal('2020-01-01');
      expect(learner.birthCity).null;
      expect(learner.birthCityCode).null;
      expect(learner.birthProvinceCode).null;
      expect(learner.birthCountryCode).null;
      expect(learner.status).null;
      expect(learner.nationalStudentId).null;
      expect(learner.nationalApprenticeId).null;
      expect(learner.division).null;
      expect(learner.sex).null;
      expect(learner.email).null;
      expect(learner.studentNumber).null;
      expect(learner.department).null;
      expect(learner.educationalTeam).null;
      expect(learner.group).null;
      expect(learner.diploma).null;
      expect(learner.userId).null;
      expect(learner.isDisabled).equal(false);
      expect(learner.updatedAt).deep.equal(now);
      expect(learner.deletedAt).deep.equal(now);
      expect(learner.deletedBy).to.deep.equal(adminUserId);
    });

    const otherLearnerFromDb = await knex('organization-learners').where({ id: otherLearner.id }).first();
    expect(otherLearnerFromDb.firstName).equal(otherLearner.firstName);
    expect(otherLearnerFromDb.lastName).equal(otherLearner.lastName);
    expect(otherLearnerFromDb.userId).equal(otherLearner.userId);

    const results = await knex('campaign-participations').where({ organizationLearnerId: organizationLearner1.id });
    expect(results).to.have.lengthOf(2);
    results.forEach((campaignParticipation) => {
      expect(campaignParticipation.userId).null;
      expect(campaignParticipation.participantExternalId).null;
      expect(campaignParticipation.deletedAt).to.deep.equal(now);
      expect(campaignParticipation.deletedBy).to.equal(adminUserId);
    });

    const otherParticipationFromDB = await knex('campaign-participations').where({ id: otherParticipation.id }).first();
    expect(otherParticipationFromDB.participantExternalId).not.null;
    expect(otherParticipationFromDB.userId).not.null;
  });

  it('should selectively anonymize attributes when organization has an import format configured', async function () {
    // given
    const learner = buildOrganizationLearner({
      organizationId,
      attributes: { Classe: '3A', 'Date de naissance': '2005-10-03' },
    });
    const importFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT);
    const importFormat = databaseBuilder.factory.buildOrganizationLearnerImportFormat({
      name: 'test-delete-anonymize',
      fileType: 'csv',
      config: {
        headers: [
          {
            name: 'Classe',
            required: true,
            config: { anonymize: ANONYMIZATION_RULE.CLEAR, validate: { type: 'string', required: true } },
          },
          {
            name: 'Date de naissance',
            required: true,
            config: {
              anonymize: ANONYMIZATION_RULE.GENERALIZE_DATE,
              validate: { type: 'date', format: 'YYYY-MM-DD', required: true },
            },
          },
        ],
      },
    });
    databaseBuilder.factory.buildOrganizationFeature({
      featureId: importFeature.id,
      organizationId,
      params: { organizationLearnerImportFormatId: importFormat.id },
    });
    await databaseBuilder.commit();

    // when
    await usecases.deleteOrganizationLearners({
      userId: adminUserId,
      organizationLearnerIds: [learner.id],
      organizationId,
      userRole: 'ORGA_ADMIN',
      client: 'PIX_ORGA',
    });

    // then
    const deletedLearner = await knex('organization-learners').where({ id: learner.id }).first();
    expect(deletedLearner.attributes).to.deep.equal({ 'Date de naissance': '2005-01-01' });
  });

  it('should clear attributes when organization has no import format configured', async function () {
    // given
    const learner = buildOrganizationLearner({
      organizationId,
      attributes: { Classe: '3A', 'Date de naissance': '2005-10-03' },
    });
    await databaseBuilder.commit();

    // when
    await usecases.deleteOrganizationLearners({
      userId: adminUserId,
      organizationLearnerIds: [learner.id],
      organizationId,
      userRole: 'ORGA_ADMIN',
      client: 'PIX_ORGA',
    });

    // then
    const deletedLearner = await knex('organization-learners').where({ id: learner.id }).first();
    expect(deletedLearner.attributes).to.be.null;
  });

  it('should detach assessments given campaignParticipations', async function () {
    // given
    const otherLearner = buildOrganizationLearner({ organizationId });
    const otherParticipation = buildCampaignParticipation({
      organizationLearnerId: otherLearner.id,
      participantExternalId,
      userId: otherLearner.userId,
    });
    const assessment1 = buildAssessment({
      id: 1,
      campaignParticipationId: campaignParticipation1.id,
      isImproved: false,
      type: Assessment.types.CAMPAIGN,
    });
    const assessment2 = buildAssessment({
      id: 2,
      campaignParticipationId: campaignParticipation1.id,
      isImproved: true,
      type: Assessment.types.CAMPAIGN,
    });

    buildAssessment({
      id: 4,
      campaignParticipationId: otherParticipation.id,
    });
    await databaseBuilder.commit();

    // when
    await usecases.deleteOrganizationLearners({
      userId: adminUserId,
      organizationLearnerIds: [organizationLearner1.id, organizationLearner2.id],
      organizationId,
      userRole: 'ORGA_ADMIN',
      client: 'PIX_ORGA',
    });

    // then
    const deletedLearners = await knex('organization-learners').whereNull('userId').pluck('id');
    expect(deletedLearners).lengthOf(2);
    expect(deletedLearners).deep.equal([organizationLearner1.id, organizationLearner2.id]);

    const assessments = await knex('assessments').whereNull('campaignParticipationId').orderBy('id').pluck('id');
    expect(assessments).lengthOf(2);
    expect(assessments).deep.equal([assessment1.id, assessment2.id]);
  });

  it('should detach assessments given deleted campaignParticipations', async function () {
    // given
    const deletedParticipation = buildCampaignParticipation({
      organizationLearnerId: organizationLearner1.id,
      participantExternalId,
      userId: organizationLearner1.userId,
      deletedAt: new Date('2023-01-01'),
      deletedBy: databaseBuilder.factory.buildUser().id,
    });
    const assessment1 = buildAssessment({
      id: 1,
      campaignParticipationId: deletedParticipation.id,
      isImproved: false,
      type: Assessment.types.CAMPAIGN,
    });
    const assessment2 = buildAssessment({
      id: 2,
      campaignParticipationId: deletedParticipation.id,
      isImproved: true,
      type: Assessment.types.CAMPAIGN,
    });

    await databaseBuilder.commit();

    // when
    await usecases.deleteOrganizationLearners({
      userId: adminUserId,
      organizationLearnerIds: [organizationLearner1.id],
      organizationId,
      userRole: PIX_ORGA.ROLES.ADMIN,
      client: CLIENTS.ORGA,
      keepPreviousDeletion: true,
    });

    // then
    const deletedLearners = await knex('organization-learners').whereNull('userId').pluck('id');
    expect(deletedLearners).lengthOf(1);
    expect(deletedLearners).deep.equal([organizationLearner1.id]);

    const assessments = await knex('assessments').whereNull('campaignParticipationId').orderBy('id').pluck('id');
    expect(assessments).lengthOf(2);
    expect(assessments).deep.equal([assessment1.id, assessment2.id]);
  });

  it('should publish an event to historize action', async function () {
    // when
    await usecases.deleteOrganizationLearners({
      userId: adminUserId,
      organizationLearnerIds: [organizationLearner1.id],
      organizationId,
      userRole: 'ORGA_ADMIN',
      client: 'PIX_ORGA',
    });

    // then
    await expect(AuditLoggingJob.name).to.have.been.performed.withJobPayloads([
      {
        client: 'PIX_ORGA',
        action: OrganizationLearnerLoggerContext.DELETION,
        role: 'ORGA_ADMIN',
        userId: adminUserId,
        occurredAt: now.toISOString(),
        targetUserIds: [organizationLearner1.id],
        data: {},
        correlationContext: EMPTY_CORRELATION_INFO,
      },
      {
        client: 'PIX_ORGA',
        action: CampaignParticipationLoggerContext.DELETION,
        role: 'ORGA_ADMIN',
        userId: adminUserId,
        occurredAt: now.toISOString(),
        targetUserIds: [campaignParticipation1.id],
        data: {},
        correlationContext: EMPTY_CORRELATION_INFO,
      },
    ]);
  });

  context('when there are badges linked to the campaign participations', function () {
    let badgesAcquisitions;
    let certifiableBadge;
    let nonCertifiableBadge;

    beforeEach(async function () {
      // given
      nonCertifiableBadge = buildBadge({
        targetProfileId: campaign.targetProfileId,
        isCertifiable: false,
      });
      certifiableBadge = buildBadge({
        targetProfileId: campaign.targetProfileId,
        isCertifiable: true,
      });

      buildBadgeAcquisition({
        badgeId: certifiableBadge.id,
        campaignParticipationId: campaignParticipation1.id,
        userId: campaignParticipation1.userId,
      });
      buildBadgeAcquisition({
        badgeId: nonCertifiableBadge.id,
        campaignParticipationId: campaignParticipation1.id,
        userId: campaignParticipation1.userId,
      });

      await databaseBuilder.commit();
    });

    it('should delete userId on non certifiable badgesAcquisitions', async function () {
      // when
      await usecases.deleteOrganizationLearners({
        userId: adminUserId,
        organizationLearnerIds: [organizationLearner1.id, organizationLearner2.id],
        organizationId,
        userRole: 'ORGA_ADMIN',
        client: 'PIX_ORGA',
      });

      // then
      badgesAcquisitions = await knex('badge-acquisitions').where({
        campaignParticipationId: campaignParticipation1.id,
      });
      const nonCertifiableBadgeAcquisition = badgesAcquisitions.find(
        (badgeAcquisition) => badgeAcquisition.badgeId === nonCertifiableBadge.id,
      );
      expect(nonCertifiableBadgeAcquisition.userId).to.be.null;
    });

    it('should not delete userId on certifiable badgesAcquisitions', async function () {
      // when
      await usecases.deleteOrganizationLearners({
        userId: adminUserId,
        organizationLearnerIds: [organizationLearner1.id, organizationLearner2.id],
        organizationId,
        userRole: 'ORGA_ADMIN',
        client: 'PIX_ORGA',
      });

      // then
      badgesAcquisitions = await knex('badge-acquisitions').where({
        campaignParticipationId: campaignParticipation1.id,
      });

      const certifiableBadgeAcquisition = badgesAcquisitions.find(
        (badgeAcquisition) => badgeAcquisition.badgeId === certifiableBadge.id,
      );
      expect(certifiableBadgeAcquisition.userId).to.equal(campaignParticipation1.userId);
    });
  });

  context('when there are profile rewards link to learner', function () {
    it('should detach profile-rewards', async function () {
      // given
      const learner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });

      const profileRewardId = databaseBuilder.factory.buildProfileReward({
        userId: learner.userId,
      }).id;

      const organizationProfileRewards = databaseBuilder.factory.buildOrganizationsProfileRewards({
        organizationId,
        profileRewardId,
      });
      await databaseBuilder.commit();

      // when
      await usecases.deleteOrganizationLearners({
        userId: adminUserId,
        organizationLearnerIds: [organizationLearner1.id, organizationLearner2.id, learner.id],
        organizationId,
        userRole: 'ORGA_ADMIN',
        client: 'PIX_ORGA',
      });

      // then
      const detachProfileRewards = await knex('organizations-profile-rewards').whereNull('profileRewardId');
      expect(detachProfileRewards).length(1);
      expect(detachProfileRewards[0].id).equal(organizationProfileRewards.id);
    });
  });

  context('when there are user-recommended-trainings linked to campaign participations', function () {
    let adminUserId,
      campaignParticipationId,
      userId,
      userRecommendedTrainingId,
      campaignId,
      organizationId,
      organizationLearner;

    beforeEach(async function () {
      //given
      adminUserId = buildUser().id;
      userId = buildUser().id;
      campaignId = buildCampaign().id;
      buildMembership({ userId: adminUserId, organizationId: buildOrganization().id, organizationRole: 'ADMIN' });

      organizationId = buildOrganization().id;

      organizationLearner = buildOrganizationLearner({ organizationId, userId });

      campaignParticipationId = buildCampaignParticipation({
        userId,
        campaignId,
        organizationLearnerId: organizationLearner.id,
      }).id;

      userRecommendedTrainingId = buildUserRecommendedTraining({ userId, campaignParticipationId }).id;

      await databaseBuilder.commit();
    });

    it('should delete campaignParticipationId', async function () {
      //when
      await usecases.deleteOrganizationLearners({
        organizationLearnerIds: [organizationLearner.id],
        userId: adminUserId,
        organizationId,
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
