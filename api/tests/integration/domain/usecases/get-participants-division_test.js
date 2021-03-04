const { expect, databaseBuilder, catchErr } = require('../../../test-helper');
const { getParticipantsDivision } = require('../../../../lib/domain/usecases/index');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Integration | UseCase | get-participants-division', () => {
  context('when the use has access to the campaign', () => {
    it('returns the participants division', async () => {
      const division = '3emeA';
      const campaign = databaseBuilder.factory.buildCampaign();
      const user = databaseBuilder.factory.buildUser.withMembership({ organizationId: campaign.organizationId });
      databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division }, { campaignId: campaign.id });
      await databaseBuilder.commit();

      const divisions = await getParticipantsDivision({ userId: user.id, campaignId: campaign.id });

      expect(divisions).to.deep.equal([{ name: '3emeA' }]);
    });
  });

  context('when the use has not access to the campaign', () => {
    it('throws an error', async () => {

      const division = '3emeA';
      const campaign = databaseBuilder.factory.buildCampaign();
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division }, { campaignId: campaign.id });
      await databaseBuilder.commit();

      const error = await catchErr(getParticipantsDivision)({ userId: user.id, campaignId: campaign.id });

      expect(error).to.be.an.instanceOf(ForbiddenAccess);
    });
  });
});
