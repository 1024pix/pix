const { expect, catchErr, databaseBuilder } = require('../../../test-helper');
const useCases = require('../../../../lib/domain/usecases/index.js');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');

describe('Integration | UseCase | find-paginated-campaign-participants-activities', function () {
  let organizationId;
  let campaignId;
  let userId;
  const page = { number: 1 };

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;
    campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
  });

  context('when requesting user is not allowed to access campaign informations', function () {
    it('should throw a UserNotAuthorizedToAccessEntityError error', async function () {
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

  context('when requesting user is allowed to access campaign', function () {
    beforeEach(async function () {
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      databaseBuilder.factory.buildCampaignParticipation({
        participantExternalId: 'Ashitaka',
        campaignId,
      });
      await databaseBuilder.commit();
    });

    it('returns the campaignParticipantsActivites of the participants of the campaign', async function () {
      const { campaignParticipantsActivities } = await useCases.findPaginatedCampaignParticipantsActivities({
        userId,
        campaignId,
        page,
      });
      expect(campaignParticipantsActivities[0].participantExternalId).to.equal('Ashitaka');
    });
  });

  context('when there are filters', function () {
    beforeEach(async function () {
      databaseBuilder.factory.buildMembership({ organizationId, userId });

      const participation1 = { participantExternalId: 'Yubaba', campaignId };
      const participant1 = { firstName: 'Chihiro', lastName: 'Ogino', division: '6eme' };
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(participant1, participation1);
      databaseBuilder.factory.buildOrganizationLearner({ userId: participant1.id, organizationId });

      const participation2 = { participantExternalId: 'Meï', campaignId };
      const participant2 = { firstName: 'Tonari', lastName: 'No Totoro', division: '5eme' };
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(participant2, participation2);

      await databaseBuilder.commit();
    });

    it('returns the campaignParticipantsActivities for the participants for the division', async function () {
      const { campaignParticipantsActivities } = await useCases.findPaginatedCampaignParticipantsActivities({
        userId,
        campaignId,
        filters: { divisions: ['6eme'] },
      });

      expect(campaignParticipantsActivities[0].participantExternalId).to.equal('Yubaba');
    });

    it('returns the campaignParticipantsActivities filtered by the search', async function () {
      const { campaignParticipantsActivities } = await useCases.findPaginatedCampaignParticipantsActivities({
        userId,
        campaignId,
        filters: { search: 'Tonari N' },
      });

      expect(campaignParticipantsActivities.length).to.equal(1);
    });
  });
});
