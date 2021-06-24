const { expect, catchErr, databaseBuilder } = require('../../../test-helper');
const useCases = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');

describe('Integration | UseCase | find-paginated-campaign-participants-activities', () => {

  let organizationId;
  let campaignId;
  let userId;
  const page = { number: 1 };

  beforeEach(async () => {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;
    campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
  });

  context('when requesting user is not allowed to access campaign informations', () => {

    it('should throw a UserNotAuthorizedToAccessEntityError error', async () => {
      // when
      const error = await catchErr(useCases.findPaginatedCampaignParticipantsActivities)({
        userId,
        campaignId,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
      expect(error.message).to.equal('User does not belong to an organization that owns the campaign');
    });
  });

  context('when requesting user is allowed to access campaign', () => {

    beforeEach(async () => {
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      databaseBuilder.factory.buildAssessmentFromParticipation({
        participantExternalId: 'Ashitaka',
        campaignId,
      });
      await databaseBuilder.commit();
    });

    it('returns the campaignParticipantsActivites of the participants of the campaign', async () => {
      const { campaignParticipantsActivities } = await useCases.findPaginatedCampaignParticipantsActivities({
        userId,
        campaignId,
        page,
      });
      expect(campaignParticipantsActivities[0].participantExternalId).to.equal('Ashitaka');
    });
  });
});
