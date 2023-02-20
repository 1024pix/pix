import { expect, databaseBuilder, catchErr } from '../../../test-helper';
import { getParticipantsGroup } from '../../../../lib/domain/usecases/index';
import { ForbiddenAccess } from '../../../../lib/domain/errors';

describe('Integration | UseCase | get-participants-group', function () {
  context('when the use has access to the campaign', function () {
    it('returns the participants group', async function () {
      const group = 'AB1';
      const campaign = databaseBuilder.factory.buildCampaign();
      const user = databaseBuilder.factory.buildUser.withMembership({ organizationId: campaign.organizationId });
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { organizationId: campaign.organizationId, group: group },
        { campaignId: campaign.id }
      );
      await databaseBuilder.commit();

      const groups = await getParticipantsGroup({ userId: user.id, campaignId: campaign.id });

      expect(groups).to.deep.equal([{ name: 'AB1' }]);
    });
  });

  context('when the user has no access to the campaign', function () {
    it('throws an error', async function () {
      const group = 'LB2';
      const campaign = databaseBuilder.factory.buildCampaign();
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { organizationId: campaign.organizationId, group: group },
        { campaignId: campaign.id }
      );
      await databaseBuilder.commit();

      const error = await catchErr(getParticipantsGroup)({ userId: user.id, campaignId: campaign.id });

      expect(error).to.be.an.instanceOf(ForbiddenAccess);
    });
  });
});
