const { expect, catchErr, databaseBuilder } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');

describe('Integration | UseCase | get-campaign-participations-activity-by-day', () => {
  let organizationId;
  let campaignId;
  let userId;

  beforeEach(async () => {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildMembership({ organizationId, userId });
    campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
  });

  context('when requesting user is not allowed to access campaign informations', () => {
    it('should throw a UserNotAuthorizedToAccessEntityError error', async () => {
      const user2 = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.getCampaignParticipationsActivityByDay)({
        userId: user2.id,
        campaignId,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
      expect(error.message).to.equal('User does not belong to the organization that owns the campaign');
    });
  });

  context('when requesting user is allowed to access campaign', () => {
    it('should return participations activity', async () => {
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, createdAt: '2021-06-01', isShared: false });
      await databaseBuilder.commit();

      // when
      const result = await usecases.getCampaignParticipationsActivityByDay({ userId, campaignId });

      // then
      expect(result.startedParticipations).to.deep.equal([{ day: '2021-06-01', count: 1 }]);
      expect(result.sharedParticipations).to.deep.equal([]);
    });
  });
});

