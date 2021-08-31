const { expect, catchErr, databaseBuilder } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Integration | UseCase | get-campaign-participations-counts-by-status', function() {
  let organizationId;
  let campaignId;
  let userId;

  beforeEach(function() {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildMembership({ organizationId, userId });
    campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
  });

  context('when requesting user is not allowed to access campaign informations', function() {
    it('should throw a UserNotAuthorizedToAccessEntityError error', async function() {
      const user2 = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.getCampaignParticipationsCountsByStatus)({
        userId: user2.id,
        campaignId,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
      expect(error.message).to.equal('User does not belong to the organization that owns the campaign');
    });
  });

  it('should return participations counts by status', async function() {
    databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: true });
    const participation1 = databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: false }).id;
    const participation2 = databaseBuilder.factory.buildCampaignParticipation({ campaignId, isShared: false }).id;

    databaseBuilder.factory.buildAssessment({ campaignParticipationId: participation1, state: Assessment.states.COMPLETED });
    databaseBuilder.factory.buildAssessment({ campaignParticipationId: participation2, state: Assessment.states.STARTED });

    await databaseBuilder.commit();

    // when
    const result = await usecases.getCampaignParticipationsCountsByStatus({ userId, campaignId });

    // then
    expect(result).to.deep.equal({ started: 1, completed: 1, shared: 1 });
  });
});

