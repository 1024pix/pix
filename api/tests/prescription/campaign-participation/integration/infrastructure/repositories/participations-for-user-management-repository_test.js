import crypto from 'node:crypto';

import sinon from 'sinon';

import { CampaignParticipationForUserManagement } from '../../../../../../src/prescription/campaign-participation/domain/models/CampaignParticipationForUserManagement.js';
import * as participationsForUserManagementRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/participations-for-user-management-repository.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

const { SHARED } = CampaignParticipationStatuses;

describe('Integration | Repository | Participations-For-User-Management', function () {
  describe('#findByUserId', function () {
    let userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
      sinon.stub(crypto, 'randomUUID').returns(1234);
    });

    context('when the given user has no participations', function () {
      it('should return an empty array', async function () {
        // given
        const participation = databaseBuilder.factory.buildCampaignParticipation();
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participation.id,
          userId: participation.userId,
          type: Assessment.types.CAMPAIGN,
        });
        await databaseBuilder.commit();

        // when
        const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

        // then
        expect(participationsForUserManagement).to.be.empty;
      });
    });

    context('when the given user has participations', function () {
      it('should return only participations for given user', async function () {
        // given
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          participantExternalId: 'special',
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation.id,
          type: Assessment.types.CAMPAIGN,
          userId,
        });

        const otherUserId = databaseBuilder.factory.buildUser().id;
        const otherParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId: otherUserId,
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: otherParticipation.id,
          type: Assessment.types.CAMPAIGN,
          userId: otherUserId,
        });
        await databaseBuilder.commit();

        // when
        const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

        // then
        expect(participationsForUserManagement).to.have.lengthOf(1);
        expect(participationsForUserManagement[0].participantExternalId).to.equal(
          campaignParticipation.participantExternalId,
        );
      });

      it('return participations with belongsToCampaignParticipation', async function () {
        // given
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          firstName: 'Blanche',
          lastName: 'Isserie',
          userId,
        });
        const combinedCourseCampaign = databaseBuilder.factory.buildCampaign();
        const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
          successRequirements: [
            CombinedCourseBlueprint.buildRequirementForCombinedCourse({
              campaignId: combinedCourseCampaign.id,
            }).toDTO(),
          ],
        });
        databaseBuilder.factory.buildCombinedCourse({
          code: 'ABCDE1234',
          name: 'Mon parcours Combiné',
          organizationId: combinedCourseCampaign.organizationId,
          questId,
        });

        const combinedCourseCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          organizationLearnerId: organizationLearner.id,
          campaignId: combinedCourseCampaign.id,
          participantExternalId: 'special',
        });

        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: combinedCourseCampaignParticipation.id,
          type: Assessment.types.CAMPAIGN,
          createdAt: new Date('2025-10-12'),
          userId,
        });
        const campaign = databaseBuilder.factory.buildCampaign();

        const participation = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign.id,
          participantExternalId: 'yoo',
          organizationLearnerId: organizationLearner.id,
        });

        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: participation.id,
          type: Assessment.types.CAMPAIGN,
          createdAt: new Date('2025-10-10'),

          userId,
        });
        await databaseBuilder.commit();

        // when
        const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

        // then
        expect(participationsForUserManagement).lengthOf(2);
        expect(participationsForUserManagement).deep.members([
          {
            id: 1234,
            campaignParticipationId: combinedCourseCampaignParticipation.id,
            participantExternalId: combinedCourseCampaignParticipation.participantExternalId,
            status: combinedCourseCampaignParticipation.status,
            createdAt: combinedCourseCampaignParticipation.createdAt,
            sharedAt: combinedCourseCampaignParticipation.sharedAt,
            campaignId: combinedCourseCampaign.id,
            campaignCode: combinedCourseCampaign.code,
            organizationLearnerFullName: `${organizationLearner.firstName} ${organizationLearner.lastName}`,
            isFromCombinedCourse: true,
            deletedAt: null,
          },
          {
            id: 1234,
            campaignParticipationId: participation.id,
            participantExternalId: participation.participantExternalId,
            status: participation.status,
            createdAt: participation.createdAt,
            sharedAt: participation.sharedAt,
            campaignId: campaign.id,
            campaignCode: campaign.code,
            organizationLearnerFullName: `${organizationLearner.firstName} ${organizationLearner.lastName}`,
            isFromCombinedCourse: false,
            deletedAt: null,
          },
        ]);
      });

      it('should return both assessment and profiles collection participations with all attributes', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign({ code: 'FUNCODE' });
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          firstName: 'Blanche',
          lastName: 'Isserie',
          userId,
        });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          organizationLearnerId: organizationLearner.id,
          campaignId: campaign.id,
          participantExternalId: '123',
          status: SHARED,
          createdAt: new Date('2010-10-10'),
          sharedAt: new Date('2010-10-11'),
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation.id,
          type: Assessment.types.CAMPAIGN,
          userId,
        });
        const profilesCollectionCampaign = databaseBuilder.factory.buildCampaign({
          code: 'HIHACODE',
          type: CampaignTypes.PROFILES_COLLECTION,
        });
        const profilesCollectionParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          organizationLearnerId: organizationLearner.id,
          campaignId: profilesCollectionCampaign.id,
          participantExternalId: '345',
          status: SHARED,
          createdAt: new Date('2010-10-12'),
          sharedAt: new Date('2010-10-13'),
        });
        await databaseBuilder.commit();

        // when
        const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

        // then
        expect(participationsForUserManagement[0]).to.be.instanceOf(CampaignParticipationForUserManagement);
        expect(participationsForUserManagement[1]).to.be.instanceOf(CampaignParticipationForUserManagement);
        expect(participationsForUserManagement).deep.members([
          {
            id: 1234,
            campaignParticipationId: profilesCollectionParticipation.id,
            participantExternalId: profilesCollectionParticipation.participantExternalId,
            status: profilesCollectionParticipation.status,
            createdAt: profilesCollectionParticipation.createdAt,
            sharedAt: profilesCollectionParticipation.sharedAt,
            campaignId: profilesCollectionCampaign.id,
            campaignCode: profilesCollectionCampaign.code,
            organizationLearnerFullName: `${organizationLearner.firstName} ${organizationLearner.lastName}`,
            isFromCombinedCourse: false,
            deletedAt: null,
          },
          {
            id: 1234,
            campaignParticipationId: campaignParticipation.id,
            participantExternalId: campaignParticipation.participantExternalId,
            status: campaignParticipation.status,
            createdAt: campaignParticipation.createdAt,
            sharedAt: campaignParticipation.sharedAt,
            campaignId: campaign.id,
            campaignCode: campaign.code,
            organizationLearnerFullName: `${organizationLearner.firstName} ${organizationLearner.lastName}`,
            isFromCombinedCourse: false,
            deletedAt: null,
          },
        ]);
      });

      it('should return only one participation where assessment isImproving', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign({ code: 'FUNCODE', type: CampaignTypes.ASSESSMENT });
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          firstName: 'Blanche',
          lastName: 'Isserie',
          userId,
        });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          organizationLearnerId: organizationLearner.id,
          campaignId: campaign.id,
          participantExternalId: '123',

          status: SHARED,
          createdAt: new Date('2010-10-10'),
          sharedAt: new Date('2010-10-11'),
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation.id,
          type: Assessment.types.CAMPAIGN,
          isImproving: false,
          state: Assessment.states.COMPLETED,
          updatedAt: new Date('2010-10-10'),
          userId,
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation.id,
          type: Assessment.types.CAMPAIGN,
          isImproving: true,
          state: Assessment.states.STARTED,
          updatedAt: new Date('2010-10-11'),
          userId,
        });

        await databaseBuilder.commit();
        // when
        const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

        expect(participationsForUserManagement).lengthOf(1);
        expect(participationsForUserManagement[0]).to.be.instanceOf(CampaignParticipationForUserManagement);
        expect(participationsForUserManagement[0]).deep.equal({
          id: 1234,
          campaignParticipationId: campaignParticipation.id,
          participantExternalId: campaignParticipation.participantExternalId,
          status: campaignParticipation.status,
          createdAt: campaignParticipation.createdAt,
          sharedAt: campaignParticipation.sharedAt,
          campaignId: campaign.id,
          campaignCode: campaign.code,
          organizationLearnerFullName: `${organizationLearner.firstName} ${organizationLearner.lastName}`,
          isFromCombinedCourse: false,
          deletedAt: null,
        });
      });

      context('When a participation is deleted', function () {
        it('should return participation with deletion attributes', async function () {
          // given
          const deletingUser = databaseBuilder.factory.buildUser({ id: 666, firstName: 'The', lastName: 'Terminator' });
          const campaign = databaseBuilder.factory.buildCampaign({ code: 'FUNCODE' });
          const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
            firstName: 'Blanche',
            lastName: 'Isserie',
            userId,
          });
          const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
            userId,
            organizationLearnerId: organizationLearner.id,
            campaignId: campaign.id,
            participantExternalId: '123',
            status: SHARED,
            createdAt: new Date('2010-10-10'),
            sharedAt: new Date('2010-10-11'),
            deletedAt: new Date('2010-10-12'),
            deletedBy: deletingUser.id,
          });
          databaseBuilder.factory.buildAssessment({
            campaignParticipationId: campaignParticipation.id,
            type: Assessment.types.CAMPAIGN,
            userId,
            updatedAt: new Date('2010-10-10'),
          });
          await databaseBuilder.commit();

          // when
          const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

          // then
          expect(participationsForUserManagement[0]).deep.equal({
            id: 1234,
            campaignParticipationId: campaignParticipation.id,
            participantExternalId: campaignParticipation.participantExternalId,
            status: SHARED,
            createdAt: campaignParticipation.createdAt,
            sharedAt: campaignParticipation.sharedAt,
            campaignId: campaign.id,
            campaignCode: campaign.code,
            deletedAt: campaignParticipation.deletedAt,
            organizationLearnerFullName: `${organizationLearner.firstName} ${organizationLearner.lastName}`,
            isFromCombinedCourse: false,
          });
        });
      });

      context('When a participation is deleted and anonymised', function () {
        it('should return participation with deletion attributes', async function () {
          // given
          const assessment = databaseBuilder.factory.buildAssessment({
            type: Assessment.types.CAMPAIGN,
            userId,
            updatedAt: new Date('2010-10-12'),
          });
          await databaseBuilder.commit();

          // when
          const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

          // then
          expect(participationsForUserManagement[0]).deep.equal({
            id: 1234,
            campaignParticipationId: null,
            participantExternalId: null,
            status: null,
            createdAt: assessment.createdAt,
            sharedAt: null,
            campaignId: null,
            campaignCode: null,
            deletedAt: assessment.updatedAt,
            organizationLearnerFullName: '-',
            isFromCombinedCourse: null,
          });
        });

        it('should return only first assessment participation with deletion attributes', async function () {
          // given
          const otherAssessment = databaseBuilder.factory.buildAssessment({
            type: Assessment.types.CAMPAIGN,
            campaignParticipationId: null,
            userId,
            createdAt: new Date('2010-10-01'),
            updatedAt: new Date('2010-10-12'),
          });
          const assessment = databaseBuilder.factory.buildAssessment({
            type: Assessment.types.CAMPAIGN,
            campaignParticipationId: null,
            userId,
            createdAt: new Date('2010-10-11'),
            updatedAt: new Date('2010-10-12'),
          });

          databaseBuilder.factory.buildAssessment({
            type: Assessment.types.CAMPAIGN,
            userId,
            campaignParticipationId: null,
            createdAt: new Date('2010-10-12'),
            updatedAt: new Date('2010-10-12'),
            isImproving: true,
            state: Assessment.states.STARTED,
          });
          await databaseBuilder.commit();

          // when
          const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

          // then
          expect(participationsForUserManagement).lengthOf(2);
          expect(participationsForUserManagement).to.deep.members([
            {
              id: 1234,
              campaignParticipationId: null,
              participantExternalId: null,
              status: null,
              createdAt: otherAssessment.createdAt,
              sharedAt: null,
              campaignId: null,
              campaignCode: null,
              deletedAt: otherAssessment.updatedAt,
              organizationLearnerFullName: '-',
              isFromCombinedCourse: null,
            },
            {
              id: 1234,
              campaignParticipationId: null,
              participantExternalId: null,
              status: null,
              createdAt: assessment.createdAt,
              sharedAt: null,
              campaignId: null,
              campaignCode: null,
              deletedAt: assessment.updatedAt,
              organizationLearnerFullName: '-',
              isFromCombinedCourse: null,
            },
          ]);
        });
      });

      context('sort', function () {
        it('should sort participations by descending createdAt', async function () {
          const campaign1 = databaseBuilder.factory.buildCampaign();
          const campaign2 = databaseBuilder.factory.buildCampaign();
          const campaign3 = databaseBuilder.factory.buildCampaign();

          // given
          const participationToCampaign1InJanuary = databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId: campaign1.id,
            participantExternalId: 'Created-January',
            createdAt: new Date('2024-01-01'),
          });
          databaseBuilder.factory.buildAssessment({
            campaignParticipationId: participationToCampaign1InJanuary.id,
            type: Assessment.types.CAMPAIGN,
            userId,
          });
          const participationToCampaign2InFebruary = databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId: campaign2.id,
            participantExternalId: 'Created-February',
            createdAt: new Date('2024-02-01'),
          });
          databaseBuilder.factory.buildAssessment({
            campaignParticipationId: participationToCampaign2InFebruary.id,
            type: Assessment.types.CAMPAIGN,
            userId,
          });
          const participationToCampaign3InMarch = databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId: campaign3.id,
            participantExternalId: 'Created-March',
            createdAt: new Date('2024-03-01'),
          });
          databaseBuilder.factory.buildAssessment({
            campaignParticipationId: participationToCampaign3InMarch.id,
            type: Assessment.types.CAMPAIGN,
            userId,
          });
          await databaseBuilder.commit();

          // when
          const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

          // then
          expect(participationsForUserManagement[0].campaignParticipationId).to.equal(
            participationToCampaign3InMarch.id,
          );
          expect(participationsForUserManagement[1].campaignParticipationId).to.equal(
            participationToCampaign2InFebruary.id,
          );
          expect(participationsForUserManagement[2].campaignParticipationId).to.equal(
            participationToCampaign1InJanuary.id,
          );
        });

        it('should sort participations by ascending campaign code when createdAt is the same', async function () {
          const campaignA = databaseBuilder.factory.buildCampaign({ code: 'AAAAAAA' });
          const campaignB = databaseBuilder.factory.buildCampaign({ code: 'BBBBBBB' });
          const campaignC = databaseBuilder.factory.buildCampaign({ code: 'CCCCCCC' });

          // given
          const participationToCampaignC = databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId: campaignC.id,
            createdAt: new Date('2020-01-02'),
          });
          databaseBuilder.factory.buildAssessment({
            campaignParticipationId: participationToCampaignC.id,
            type: Assessment.types.CAMPAIGN,
            userId,
          });
          const participationToCampaignB = databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId: campaignB.id,
            createdAt: new Date('2020-01-02'),
          });
          databaseBuilder.factory.buildAssessment({
            campaignParticipationId: participationToCampaignB.id,
            type: Assessment.types.CAMPAIGN,
            userId,
          });
          const participationToCampaignA = databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId: campaignA.id,
            createdAt: new Date('2020-01-02'),
          });
          databaseBuilder.factory.buildAssessment({
            campaignParticipationId: participationToCampaignA.id,
            type: Assessment.types.CAMPAIGN,
            userId,
          });
          await databaseBuilder.commit();

          // when
          const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

          // then
          expect(participationsForUserManagement[0].campaignParticipationId).to.equal(participationToCampaignA.id);
          expect(participationsForUserManagement[1].campaignParticipationId).to.equal(participationToCampaignB.id);
          expect(participationsForUserManagement[2].campaignParticipationId).to.equal(participationToCampaignC.id);
        });

        it('should sort participations by descending sharedAt when createdAt is the same and campaign code is the same', async function () {
          const campaign = databaseBuilder.factory.buildCampaign();
          // given
          const participationSharedInJanuary = databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId: campaign.id,
            participantExternalId: 'Shared-January',
            createdAt: new Date('2020-01-02'),
            sharedAt: new Date('2023-01-01'),
            isImproved: true,
          });
          databaseBuilder.factory.buildAssessment({
            campaignParticipationId: participationSharedInJanuary.id,
            type: Assessment.types.CAMPAIGN,
            userId,
          });
          const participationSharedInFebruary = databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId: campaign.id,
            participantExternalId: 'Shared-February',
            createdAt: new Date('2020-01-02'),
            sharedAt: new Date('2023-02-01'),
          });
          databaseBuilder.factory.buildAssessment({
            campaignParticipationId: participationSharedInFebruary.id,
            type: Assessment.types.CAMPAIGN,
            userId,
          });
          const participationSharedInMarch = databaseBuilder.factory.buildCampaignParticipation({
            userId,
            campaignId: campaign.id,
            participantExternalId: 'Shared-March',
            createdAt: new Date('2020-01-02'),
            sharedAt: new Date('2023-03-01'),
            isImproved: true,
          });
          databaseBuilder.factory.buildAssessment({
            campaignParticipationId: participationSharedInMarch.id,
            type: Assessment.types.CAMPAIGN,
            userId,
          });
          await databaseBuilder.commit();

          // when
          const participationsForUserManagement = await participationsForUserManagementRepository.findByUserId(userId);

          // then
          expect(participationsForUserManagement[0].campaignParticipationId).to.equal(participationSharedInMarch.id);
          expect(participationsForUserManagement[1].campaignParticipationId).to.equal(participationSharedInFebruary.id);
          expect(participationsForUserManagement[2].campaignParticipationId).to.equal(participationSharedInJanuary.id);
        });
      });
    });
  });
});
