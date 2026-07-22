import sinon from 'sinon';

import { CampaignBelongsToCombinedCourseError } from '../../../../../../src/prescription/campaign/domain/errors.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import * as campaignAdministrationRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-administration-repository.js';
import { CampaignParticipationLoggerContext } from '../../../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { PIX_ADMIN } from '../../../../../../src/shared/constants.js';
import { CAMPAIGN_FEATURES } from '../../../../../../src/shared/constants.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { AuditLoggingJob } from '../../../../../../src/shared/domain/models/jobs/AuditLoggingJob.js';
import { Membership } from '../../../../../../src/shared/domain/models/Membership.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

const {
  buildAssessment,
  buildBadge,
  buildBadgeAcquisition,
  buildCampaign,
  buildCampaignParticipation,
  buildMembership,
  buildUserRecommendedTraining,
  buildOrganization,
  buildPixAdminRole,
  buildUser,
  buildTargetProfile,
  buildCampaignFeature,
  buildFeature,
} = databaseBuilder.factory;

describe('Integration | UseCases | delete-campaign', function () {
  describe('success case', function () {
    let clock;
    let now;

    beforeEach(function () {
      now = new Date('1992-07-07');
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('should not throw when user is admin of the organization', async function () {
      // given
      const userId = buildUser().id;
      const organizationId = buildOrganization().id;
      buildMembership({ userId, organizationId, organizationRole: Membership.roles.ADMIN });
      const campaignId = buildCampaign({ organizationId }).id;
      buildCampaignParticipation({ campaignId });

      await databaseBuilder.commit();

      // when & then
      await expect(usecases.deleteCampaigns({ userId, organizationId, campaignIds: [campaignId] })).fulfilled;
    });

    it('should not throw when user is owner of the campaign', async function () {
      // given
      const userId = buildUser().id;
      const organizationId = buildOrganization().id;
      buildMembership({ userId, organizationId, organizationRole: Membership.roles.MEMBER });
      const campaignId = buildCampaign({ ownerId: userId, organizationId }).id;
      buildCampaignParticipation({ campaignId });

      await databaseBuilder.commit();

      // when & then
      await expect(usecases.deleteCampaigns({ userId, organizationId, campaignIds: [campaignId] })).fulfilled;
    });

    it('should not throw when flag is part of deleting combined course is true', async function () {
      // given
      const userId = buildUser().id;
      const organizationId = buildOrganization().id;
      buildMembership({ userId, organizationId, organizationRole: Membership.roles.ADMIN });
      const campaignId = buildCampaign({ organizationId }).id;

      const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId }).toDTO()],
      });
      databaseBuilder.factory.buildCombinedCourse({
        code: 'ABCDE1234',
        name: 'Mon parcours Combiné',
        organizationId,
        questId,
      });

      buildCampaignParticipation({ campaignId });

      await databaseBuilder.commit();

      // when & then
      await expect(
        usecases.deleteCampaigns({
          userId,
          organizationId,
          campaignIds: [campaignId],
          isPartOfDeletingCombinedCourse: true,
        }),
      ).fulfilled;
    });

    [(PIX_ADMIN.ROLES.METIER, PIX_ADMIN.ROLES.SUPPORT, PIX_ADMIN.ROLES.SUPER_ADMIN)].forEach((role) => {
      it(`should not throw when user's PixAdmin role is ${role}`, async function () {
        // given
        const adminUserId = buildUser().id;
        buildPixAdminRole({ userId: adminUserId, role });

        const userId = buildUser().id;
        const organizationId = buildOrganization().id;
        buildMembership({ userId, organizationId, organizationRole: Membership.roles.MEMBER });

        const campaignId = buildCampaign({ ownerId: userId, organizationId }).id;
        buildCampaignParticipation({ campaignId });

        await databaseBuilder.commit();

        // when & then
        await expect(usecases.deleteCampaigns({ userId: adminUserId, organizationId, campaignIds: [campaignId] }))
          .fulfilled;
      });
    });

    it('should delete campaign for given id and anonymize', async function () {
      // given
      const userId = buildUser().id;
      const organizationId = buildOrganization().id;
      buildMembership({ userId, organizationId, organizationRole: Membership.roles.MEMBER });
      const campaignId = buildCampaign({
        ownerId: userId,
        organizationId,
        name: 'nom de campagne',
        title: 'titre de campagne',
      }).id;

      await databaseBuilder.commit();

      // when
      await usecases.deleteCampaigns({ userId, organizationId, campaignIds: [campaignId] });

      const updatedCampaign = await campaignAdministrationRepository.get(campaignId);

      // then
      expect(updatedCampaign.deletedAt).to.deep.equal(now);
      expect(updatedCampaign.deletedBy).to.equal(userId);
      expect(updatedCampaign.name).to.equal('(anonymized)');
      expect(updatedCampaign.title).to.be.null;
    });

    context('when there are user-recommended-trainings linked to campaign participations', function () {
      let adminUserId, campaignParticipationId, userId, userRecommendedTrainingId, campaignId, organizationId;

      beforeEach(async function () {
        //given
        adminUserId = buildUser().id;
        userId = buildUser().id;
        organizationId = buildOrganization().id;
        buildMembership({ userId: adminUserId, organizationId, organizationRole: 'ADMIN' });
        campaignId = buildCampaign({ organizationId }).id;
        campaignParticipationId = buildCampaignParticipation({ userId, campaignId, organizationId }).id;
        userRecommendedTrainingId = buildUserRecommendedTraining({ userId, campaignParticipationId }).id;

        await databaseBuilder.commit();
      });

      it('should delete campaignParticipationId', async function () {
        //when
        await usecases.deleteCampaigns({
          userId: adminUserId,
          campaignIds: [campaignId],
          organizationId,
        });

        //then
        const userRecommendedTrainingAnonymized = await knex('user-recommended-trainings')
          .where('id', userRecommendedTrainingId)
          .first();

        expect(userRecommendedTrainingAnonymized.campaignParticipationId).to.be.null;
      });
    });

    context('With campaign participations', function () {
      let adminUserId;
      let campaignId;
      let organizationId;
      let userId;
      let campaignParticipationId;
      let organizationLearnerId;
      let targetProfileId;

      beforeEach(async function () {
        adminUserId = databaseBuilder.factory.buildUser().id;
        organizationId = buildOrganization().id;
        buildMembership({ userId: adminUserId, organizationId, organizationRole: 'ADMIN' });
        userId = databaseBuilder.factory.buildUser().id;
        targetProfileId = buildTargetProfile().id;
        campaignId = databaseBuilder.factory.buildCampaign({ organizationId, targetProfileId }).id;
        organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId }).id;
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
        // when
        await usecases.deleteCampaigns({
          userId: adminUserId,
          campaignIds: [campaignId],
          organizationId,
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

      it('should update deleted participation', async function () {
        const deletedAt = new Date('2024-01-01');
        const deletedBy = databaseBuilder.factory.buildUser().id;

        const participationId = databaseBuilder.factory.buildCampaignParticipation({
          isImproved: true,
          participantExternalId: 'email olala',
          organizationLearnerId,
          userId,
          deletedAt,
          deletedBy,
          campaignId,
        }).id;

        await databaseBuilder.commit();

        await usecases.deleteCampaigns({
          userId: adminUserId,
          campaignIds: [campaignId],
          organizationId,
        });

        const deletedCampaignParticipation = await knex('campaign-participations')
          .where({ id: participationId })
          .first();

        expect(deletedCampaignParticipation.participantExternalId).not.to.equal(null);
        expect(deletedCampaignParticipation.userId).to.equal(userId);
        expect(deletedCampaignParticipation.deletedAt).to.deep.equal(deletedAt);
        expect(deletedCampaignParticipation.deletedBy).to.equal(deletedBy);
      });

      it('should update delete participation', async function () {
        const deletedAt = new Date('2024-01-01');
        const deletedBy = databaseBuilder.factory.buildUser().id;

        const participationId = databaseBuilder.factory.buildCampaignParticipation({
          isImproved: true,
          participantExternalId: 'email olala',
          organizationLearnerId,
          userId,
          deletedAt,
          deletedBy,
          campaignId,
        }).id;

        await databaseBuilder.commit();

        await usecases.deleteCampaigns({
          userId: adminUserId,
          campaignIds: [campaignId],
          organizationId,
          keepPreviousDeletion: true,
        });

        const deletedCampaignParticipation = await knex('campaign-participations')
          .where({ id: participationId })
          .first();

        expect(deletedCampaignParticipation.participantExternalId).null;
        expect(deletedCampaignParticipation.userId).null;
        expect(deletedCampaignParticipation.deletedAt).to.deep.equal(deletedAt);
        expect(deletedCampaignParticipation.deletedBy).to.equal(deletedBy);
      });

      it('should delete all campaignParticipations even already deleted', async function () {
        // given
        const deletedUserId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildCampaignParticipation({
          isImproved: true,
          participantExternalId: 'email olala',
          organizationLearnerId,
          userId,
          deletedAt: new Date('2024-01-01'),
          deletedBy: deletedUserId,
          campaignId,
        });

        await databaseBuilder.commit();

        // when
        await usecases.deleteCampaigns({
          userId: adminUserId,
          campaignIds: [campaignId],
          organizationId,
          keepPreviousDeletion: true,
        });

        // then
        const results = await knex('campaign-participations')
          .select('userId', 'participantExternalId', 'deletedAt', 'deletedBy')
          .where({ organizationLearnerId });

        expect(results).to.have.lengthOf(2);
        expect(results).deep.members([
          {
            userId: null,
            participantExternalId: null,
            deletedAt: now,
            deletedBy: adminUserId,
          },
          {
            userId: null,
            participantExternalId: null,
            deletedAt: new Date('2024-01-01'),
            deletedBy: deletedUserId,
          },
        ]);
      });

      it('should publish an event to historize action', async function () {
        // when
        // when
        await usecases.deleteCampaigns({
          userId: adminUserId,
          campaignIds: [campaignId],
          organizationId,
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
          correlationContext: EMPTY_CORRELATION_INFO,
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
          await usecases.deleteCampaigns({
            userId: adminUserId,
            campaignIds: [campaignId],
            organizationId,
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
          await usecases.deleteCampaigns({
            userId: adminUserId,
            campaignIds: [campaignId],
            organizationId,
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
          await usecases.deleteCampaigns({
            userId: adminUserId,
            campaignIds: [campaignId],
            organizationId,
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
    });

    context('With external id campaign feature', function () {
      let campaignId;
      let adminUserId;
      let organizationId;

      beforeEach(async function () {
        const featureId = buildFeature({
          key: CAMPAIGN_FEATURES.EXTERNAL_ID.key,
        }).id;

        adminUserId = buildUser().id;
        organizationId = buildOrganization().id;
        buildMembership({ userId: adminUserId, organizationId, organizationRole: 'ADMIN' });
        campaignId = buildCampaign({ organizationId }).id;
        buildCampaignFeature({ campaignId, featureId, params: { label: 'External ID', type: 'email' } });

        await databaseBuilder.commit();
      });

      it('should empty external id label param', async function () {
        // when
        await usecases.deleteCampaigns({
          userId: adminUserId,
          campaignIds: [campaignId],
          organizationId,
        });

        // then
        const results = await knex('campaign-features').where({ campaignId });

        expect(results).to.have.lengthOf(1);
        expect(results[0].params).to.not.have.property('label');
      });
    });
  });
  describe('error case', function () {
    it('should throw when one campaign belongs to a combined course and when is flag isPartOfDeletingCombinedCourse is false or undefined', async function () {
      // given
      const userId = buildUser().id;
      const organizationId = buildOrganization().id;
      buildMembership({ userId, organizationId, organizationRole: Membership.roles.ADMIN });
      const campaignId = buildCampaign({ organizationId }).id;

      const { id: questIdForError } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId }).toDTO()],
      });
      databaseBuilder.factory.buildCombinedCourse({
        code: 'ABCDE1234',
        name: 'Mon parcours Combiné',
        organizationId,
        questId: questIdForError,
      });

      buildCampaignParticipation({ campaignId });

      await databaseBuilder.commit();

      // when & then
      const error = await catchErr(usecases.deleteCampaigns)({ userId, organizationId, campaignIds: [campaignId] });
      expect(error).instanceOf(CampaignBelongsToCombinedCourseError);
    });
  });
});
