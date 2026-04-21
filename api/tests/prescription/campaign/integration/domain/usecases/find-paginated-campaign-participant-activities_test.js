import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../../src/shared/domain/errors.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | UseCase | find-paginated-campaign-participant-activities', function () {
  let organizationId;
  let campaignId;
  let organizationLearner;
  let userId;
  const page = { number: 1 };

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    userId = databaseBuilder.factory.buildUser().id;
    campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
    organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });

    await databaseBuilder.commit();
  });

  context('when requesting user is not allowed to access campaign information', function () {
    it('should throw a UserNotAuthorizedToAccessEntityError error', async function () {
      // when
      const error = await catchErr(usecases.findPaginatedCampaignParticipantActivities)({
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
        id: 1,
        campaignId,
        organizationLearnerId: organizationLearner.id,
        userId: organizationLearner.userId,
      });

      await databaseBuilder.commit();
    });

    it('returns the campaignParticipantsActivites of the participants of the campaign', async function () {
      const { campaignParticipantsActivities } = await usecases.findPaginatedCampaignParticipantActivities({
        userId,
        campaignId,
        page,
      });
      expect(campaignParticipantsActivities).lengthOf(1);
      expect(campaignParticipantsActivities[0].lastCampaignParticipationId).to.equal(1);
    });
  });

  context('when there are filters', function () {
    beforeEach(async function () {
      databaseBuilder.factory.buildMembership({ organizationId, userId });

      const organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Chihiro',
        lastName: 'Ogino',
        division: '6eme',
        organizationId,
      });
      const organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({
        firstName: 'Tonari',
        lastName: 'No Totoro',
        division: '5eme',
        organizationId,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        id: 1,
        campaignId,
        organizationLearnerId: organizationLearner1.id,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        id: 2,
        campaignId,
        organizationLearnerId: organizationLearner2.id,
      });

      await databaseBuilder.commit();
    });

    it('returns the campaignParticipantsActivities for the participants for the division', async function () {
      const { campaignParticipantsActivities } = await usecases.findPaginatedCampaignParticipantActivities({
        userId,
        campaignId,
        filters: { divisions: ['6eme'] },
      });

      expect(campaignParticipantsActivities[0].lastCampaignParticipationId).to.equal(1);
    });

    it('returns the campaignParticipantsActivities filtered by the search', async function () {
      const { campaignParticipantsActivities } = await usecases.findPaginatedCampaignParticipantActivities({
        userId,
        campaignId,
        filters: { search: 'Tonari N' },
      });

      expect(campaignParticipantsActivities).to.have.lengthOf(1);
    });
  });
});
