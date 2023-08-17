import { ForbiddenAccess } from '../../../../lib/domain/errors.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { catchErr, databaseBuilder, expect } from '../../../test-helper.js';

const { getParticipantsDivision } = usecases;

describe('Integration | UseCase | get-participants-division', function () {
  context('when the use has access to the campaign', function () {
    it('returns the participants division', async function () {
      const division = '3emeA';
      const campaign = databaseBuilder.factory.buildCampaign();
      const user = databaseBuilder.factory.buildUser.withMembership({ organizationId: campaign.organizationId });
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { organizationId: campaign.organizationId, division: division },
        { campaignId: campaign.id },
      );
      await databaseBuilder.commit();

      const divisions = await getParticipantsDivision({ userId: user.id, campaignId: campaign.id });

      expect(divisions).to.deep.equal([{ name: '3emeA' }]);
    });
  });

  context('when the use has not access to the campaign', function () {
    it('throws an error', async function () {
      const division = '3emeA';
      const campaign = databaseBuilder.factory.buildCampaign();
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { organizationId: campaign.organizationId, division: division },
        { campaignId: campaign.id },
      );
      await databaseBuilder.commit();

      const error = await catchErr(getParticipantsDivision)({ userId: user.id, campaignId: campaign.id });

      expect(error).to.be.an.instanceOf(ForbiddenAccess);
    });
  });
});
