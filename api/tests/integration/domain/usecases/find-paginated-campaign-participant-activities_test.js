const { expect, catchErr, databaseBuilder } = require('../../../test-helper');
const useCases = require('../../../../lib/domain/usecases');
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
      databaseBuilder.factory.buildAssessmentFromParticipation({
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

  context('when there is a filter on division', function () {
    beforeEach(async function () {
      databaseBuilder.factory.buildMembership({ organizationId, userId });

      const participation1 = { participantExternalId: 'Yubaba', campaignId };
      const participant1 = { id: 456, firstName: 'Chihiro', lastName: 'Ogino' };
      databaseBuilder.factory.buildAssessmentFromParticipation(participation1, participant1);
      databaseBuilder.factory.buildSchoolingRegistration({ userId: participant1.id, organizationId, division: '6eme' });

      const participation2 = { participantExternalId: 'Meï', campaignId };
      const participant2 = { id: 457, firstName: 'Tonari', lastName: 'No Totoro' };
      databaseBuilder.factory.buildAssessmentFromParticipation(participation2, participant2);
      databaseBuilder.factory.buildSchoolingRegistration({ userId: participant2.id, organizationId, division: '5eme' });

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
  });
});
