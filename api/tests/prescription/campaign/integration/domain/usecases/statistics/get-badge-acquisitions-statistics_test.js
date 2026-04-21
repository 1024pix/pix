import BadgeAcquisitionParticipationStatistic from '../../../../../../../src/prescription/campaign/domain/read-models/BadgeAcquisitionParticipationStatistic.js';
import { usecases } from '../../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../../../src/shared/domain/errors.js';
import { databaseBuilder } from '../../../../../../tooling/databases.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';

describe('Integration | UseCase | Statistics | get-badge-acquisitions-statistics', function () {
  context('when requesting user is not allowed to access campaign informations', function () {
    it('should throw a UserNotAuthorizedToAccessEntityError error', async function () {
      const user2 = databaseBuilder.factory.buildUser();
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.getBadgeAcquisitionsStatistics)({
        userId: user2.id,
        campaignId,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
      expect(error.message).to.equal('User does not belong to the organization that owns the campaign');
    });
  });

  context('when requesting user is allowed to access campaign informations', function () {
    context('when there are no badges for the campaign', function () {
      let userId;
      let campaignId;

      beforeEach(async function () {
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildMembership({ organizationId, userId });
        campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId, organizationId }).id;
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaignId,
          userId: userId,
        });

        await databaseBuilder.commit();
      });

      it('should return an empty array', async function () {
        // when
        const result = await usecases.getBadgeAcquisitionsStatistics({
          userId: userId,
          campaignId,
        });

        // then
        expect(result).to.be.empty;
      });
    });

    context('when there are no participations for the given campaign', function () {
      let userId;
      let campaignId;

      beforeEach(async function () {
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        databaseBuilder.factory.buildBadge({ targetProfileId }).id;
        databaseBuilder.factory.buildBadge({ targetProfileId }).id;

        userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildMembership({ organizationId, userId });

        campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId, organizationId }).id;

        await databaseBuilder.commit();
      });

      it('should return the expected badge statistics', async function () {
        // when
        const result = await usecases.getBadgeAcquisitionsStatistics({
          userId: userId,
          campaignId,
        });

        // then
        expect(result[0].count).to.equal(0);
        expect(result[0].percentage).to.equal(0);
        expect(result[1].count).to.equal(0);
        expect(result[1].percentage).to.equal(0);
      });
    });

    context('when there are badges and participations', function () {
      let userId;
      let campaignId;

      let badge1Id;
      let badge2Id;
      let badge3Id;

      beforeEach(async function () {
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;

        badge1Id = databaseBuilder.factory.buildBadge({ targetProfileId, title: 'badge1' }).id;
        badge2Id = databaseBuilder.factory.buildBadge({ targetProfileId, title: 'badge2' }).id;
        badge3Id = databaseBuilder.factory.buildBadge({ targetProfileId, title: 'badge3' }).id;

        userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildMembership({ organizationId, userId });

        campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId, organizationId }).id;
        const campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({ campaignId });
        const campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({ campaignId });
        const campaignParticipation3 = databaseBuilder.factory.buildCampaignParticipation({ campaignId });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId });

        databaseBuilder.factory.buildBadgeAcquisition({
          userId: campaignParticipation1.userId,
          campaignParticipationId: campaignParticipation1.id,
          badgeId: badge1Id,
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          userId: campaignParticipation2.userId,
          campaignParticipationId: campaignParticipation2.id,
          badgeId: badge2Id,
        });
        databaseBuilder.factory.buildBadgeAcquisition({
          userId: campaignParticipation3.userId,
          campaignParticipationId: campaignParticipation3.id,
          badgeId: badge2Id,
        });

        await databaseBuilder.commit();
      });

      it('should return an array of BadgeAcquisitionParticipationStatistic', async function () {
        // when
        const result = await usecases.getBadgeAcquisitionsStatistics({
          userId,
          campaignId,
        });

        // then
        expect(result).to.have.lengthOf(3);
        expect(result[0]).to.be.instanceOf(BadgeAcquisitionParticipationStatistic);
      });

      it('should return the expected badges statistics', async function () {
        // when
        const result = await usecases.getBadgeAcquisitionsStatistics({
          userId,
          campaignId,
        });

        // then
        expect(result).to.have.lengthOf(3);

        const badge1Stats = result.find((badgeStats) => badgeStats.badge.id === badge1Id);
        expect(badge1Stats.count).to.equal(1);
        expect(badge1Stats.percentage).to.equal(17);

        const badge2Stats = result.find((badgeStats) => badgeStats.badge.id === badge2Id);
        expect(badge2Stats.count).to.equal(2);
        expect(badge2Stats.percentage).to.equal(33);

        const badge3Stats = result.find((badgeStats) => badgeStats.badge.id === badge3Id);
        expect(badge3Stats.count).to.equal(0);
        expect(badge3Stats.percentage).to.equal(0);
      });
    });
  });
});
