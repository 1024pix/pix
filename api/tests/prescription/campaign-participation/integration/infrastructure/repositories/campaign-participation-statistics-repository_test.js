import dayjs from 'dayjs';

import * as organizationLearnerStatisticsRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-participation-statistics-repository.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

const { buildCampaign, buildCampaignParticipation, buildUser, buildOrganization } = databaseBuilder.factory;

const buildParticipationSharedMoreThan30DaysAgo = (data) =>
  buildCampaignParticipation({ ...data, sharedAt: dayjs().subtract(31, 'day').toDate() });

describe('Integration | Repository | Campaign Participation Statistics', function () {
  describe('#getParticipationCountOnPrescriberCampaigns', function () {
    let organizationId, ownerId;

    beforeEach(async function () {
      organizationId = buildOrganization().id;
      ownerId = buildUser().id;

      await databaseBuilder.commit();
    });

    context('when there are no campaigns', function () {
      it('should return zero counts', async function () {
        // when
        const statistics = await organizationLearnerStatisticsRepository.getParticipationCountOnPrescriberCampaigns(
          organizationId,
          ownerId,
        );

        // then
        expect(statistics).to.deep.equal({
          totalParticipationCount: 0,
          completedParticipationCount: 0,
          sharedParticipationCountLastThirtyDays: 0,
        });
      });
    });

    context('when there are campaigns from other organizations or owners', function () {
      it('should not include them in statistics', async function () {
        // given
        const otherOrganizationId = buildOrganization().id;
        const otherOwnerId = buildUser().id;

        // Campaign from target organization but different owner
        const campaignId1 = buildCampaign({
          organizationId,
          ownerId: otherOwnerId,
        }).id;

        // Campaign from different organization but same owner
        const campaignId2 = buildCampaign({
          organizationId: otherOrganizationId,
          ownerId,
        }).id;

        // Target campaign
        const campaignId3 = buildCampaign({ organizationId, ownerId }).id;

        buildParticipationSharedMoreThan30DaysAgo({
          campaignId: campaignId1,
          status: CampaignParticipationStatuses.SHARED,
        });
        buildParticipationSharedMoreThan30DaysAgo({
          campaignId: campaignId2,
          status: CampaignParticipationStatuses.SHARED,
        });
        buildParticipationSharedMoreThan30DaysAgo({
          campaignId: campaignId3,
          status: CampaignParticipationStatuses.SHARED,
        });

        await databaseBuilder.commit();

        // when
        const statistics = await organizationLearnerStatisticsRepository.getParticipationCountOnPrescriberCampaigns(
          organizationId,
          ownerId,
        );

        // then
        expect(statistics).to.deep.equal({
          totalParticipationCount: 1,
          completedParticipationCount: 1,
          sharedParticipationCountLastThirtyDays: 0,
        });
      });
    });

    context('when campaigns are deleted or archived', function () {
      it('should not include them in statistics', async function () {
        // given
        const deletedCampaignId = buildCampaign({
          organizationId,
          ownerId,

          deletedAt: new Date('2023-01-01'),
        }).id;

        const archivedCampaignId = buildCampaign({
          organizationId,
          ownerId,

          archivedAt: new Date('2023-01-01'),
        }).id;

        const activeCampaignId = buildCampaign({ organizationId, ownerId }).id;

        buildParticipationSharedMoreThan30DaysAgo({
          campaignId: deletedCampaignId,
          status: CampaignParticipationStatuses.SHARED,
        });
        buildParticipationSharedMoreThan30DaysAgo({
          campaignId: archivedCampaignId,
          status: CampaignParticipationStatuses.SHARED,
        });
        buildParticipationSharedMoreThan30DaysAgo({
          campaignId: activeCampaignId,
          status: CampaignParticipationStatuses.SHARED,
        });

        await databaseBuilder.commit();

        // when
        const statistics = await organizationLearnerStatisticsRepository.getParticipationCountOnPrescriberCampaigns(
          organizationId,
          ownerId,
        );

        // then
        expect(statistics).to.deep.equal({
          totalParticipationCount: 1,
          completedParticipationCount: 1,
          sharedParticipationCountLastThirtyDays: 0,
        });
      });
    });

    context('when there are participations with all possible statuses', function () {
      it('should only count SHARED status as completed', async function () {
        // given
        const campaignId = buildCampaign({
          organizationId,
          ownerId,
          type: CampaignTypes.PROFILES_COLLECTION,
        }).id;

        // Create participations with all possible statuses
        buildParticipationSharedMoreThan30DaysAgo({
          campaignId,
          status: CampaignParticipationStatuses.STARTED,
        });
        buildParticipationSharedMoreThan30DaysAgo({
          campaignId,
          status: CampaignParticipationStatuses.STARTED,
        });
        buildParticipationSharedMoreThan30DaysAgo({
          campaignId,
          status: CampaignParticipationStatuses.SHARED,
        });
        buildParticipationSharedMoreThan30DaysAgo({
          campaignId,
          status: CampaignParticipationStatuses.SHARED,
        });

        await databaseBuilder.commit();

        // when
        const statistics = await organizationLearnerStatisticsRepository.getParticipationCountOnPrescriberCampaigns(
          organizationId,
          ownerId,
        );

        // then
        expect(statistics).to.deep.equal({
          totalParticipationCount: 4,
          completedParticipationCount: 2,
          sharedParticipationCountLastThirtyDays: 0,
        });
      });
    });

    context('when there are participations shared in the last 30 days', function () {
      it('should count participations shared within the last 30 days', async function () {
        // given
        const campaignId = buildCampaign({ organizationId, ownerId }).id;

        const now = new Date();
        const twentyDaysAgo = dayjs().subtract(20, 'day').toDate();
        const fortyDaysAgo = dayjs().subtract(40, 'day').toDate();

        // Participation shared within last 30 days
        buildCampaignParticipation({
          campaignId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: twentyDaysAgo,
        });

        // Another participation shared within last 30 days
        buildCampaignParticipation({
          campaignId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: now,
        });

        // Participation shared more than 30 days ago
        buildCampaignParticipation({
          campaignId,
          status: CampaignParticipationStatuses.SHARED,
          sharedAt: fortyDaysAgo,
        });

        // Participation with no sharedAt (should not be counted)
        buildCampaignParticipation({
          campaignId,
          status: CampaignParticipationStatuses.STARTED,
        });

        await databaseBuilder.commit();

        // when
        const statistics = await organizationLearnerStatisticsRepository.getParticipationCountOnPrescriberCampaigns(
          organizationId,
          ownerId,
        );

        // then
        expect(statistics).to.deep.equal({
          totalParticipationCount: 4,
          completedParticipationCount: 3,
          sharedParticipationCountLastThirtyDays: 2,
        });
      });
    });

    context('when there are deleted participations', function () {
      it('should not include deleted participations in statistics', async function () {
        // given
        const campaignId = buildCampaign({ organizationId, ownerId }).id;

        // Active participation
        buildParticipationSharedMoreThan30DaysAgo({
          campaignId,
          status: CampaignParticipationStatuses.SHARED,
        });

        // Deleted participation
        buildParticipationSharedMoreThan30DaysAgo({
          campaignId,
          status: CampaignParticipationStatuses.SHARED,
          deletedAt: new Date('2023-01-01'),
        });

        await databaseBuilder.commit();

        // when
        const statistics = await organizationLearnerStatisticsRepository.getParticipationCountOnPrescriberCampaigns(
          organizationId,
          ownerId,
        );

        // then
        expect(statistics).to.deep.equal({
          totalParticipationCount: 1,
          completedParticipationCount: 1,
          sharedParticipationCountLastThirtyDays: 0,
        });
      });
    });

    context('when there are improved participations', function () {
      it('should not include improved participations in statistics', async function () {
        // given
        const campaignId = buildCampaign({ organizationId, ownerId }).id;

        // Regular participation
        buildParticipationSharedMoreThan30DaysAgo({
          campaignId,
          status: CampaignParticipationStatuses.SHARED,
          isImproved: false,
        });

        // Improved participation (should be excluded)
        buildParticipationSharedMoreThan30DaysAgo({
          campaignId,
          status: CampaignParticipationStatuses.SHARED,
          isImproved: true,
        });

        await databaseBuilder.commit();

        // when
        const statistics = await organizationLearnerStatisticsRepository.getParticipationCountOnPrescriberCampaigns(
          organizationId,
          ownerId,
        );

        // then
        expect(statistics).to.deep.equal({
          totalParticipationCount: 1,
          completedParticipationCount: 1,
          sharedParticipationCountLastThirtyDays: 0,
        });
      });
    });

    context('when there are deleted campaigns', function () {
      it('should exclude participations from deleted campaigns', async function () {
        // given
        const deletedCampaignId = buildCampaign({
          organizationId,
          ownerId,
          deletedAt: new Date('2023-01-01'),
        }).id;

        buildParticipationSharedMoreThan30DaysAgo({
          campaignId: deletedCampaignId,
          status: CampaignParticipationStatuses.SHARED,
        });

        await databaseBuilder.commit();

        // when
        const statistics = await organizationLearnerStatisticsRepository.getParticipationCountOnPrescriberCampaigns(
          organizationId,
          ownerId,
        );

        // then
        expect(statistics.totalParticipationCount).to.equal(0);
      });
    });

    context('when there are archived campaigns', function () {
      it('should exclude participations from archived campaigns', async function () {
        // given
        const archivedCampaignId = buildCampaign({
          organizationId,
          ownerId,
          archivedAt: new Date('2023-01-01'),
        }).id;

        buildParticipationSharedMoreThan30DaysAgo({
          campaignId: archivedCampaignId,
          status: CampaignParticipationStatuses.SHARED,
        });

        await databaseBuilder.commit();

        // when
        const statistics = await organizationLearnerStatisticsRepository.getParticipationCountOnPrescriberCampaigns(
          organizationId,
          ownerId,
        );

        // then
        expect(statistics.totalParticipationCount).to.equal(0);
      });
    });
  });
});
