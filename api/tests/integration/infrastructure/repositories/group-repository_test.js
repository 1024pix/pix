const { expect, databaseBuilder } = require('../../../test-helper');
const groupRepository = require('../../../../lib/infrastructure/repositories/group-repository');

describe('Integration | Repository | Group', function () {
  describe('#findByCampaignId', function () {
    it('returns the group from schooling registration associated to the given campaign', async function () {
      const group1 = 'L1';
      const group2 = 'L2';
      const campaign = databaseBuilder.factory.buildCampaign();

      databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration(
        { organizationId: campaign.organizationId, group: group1 },
        { campaignId: campaign.id }
      );
      databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration(
        { organizationId: campaign.organizationId, group: group2 },
        { campaignId: campaign.id }
      );
      await databaseBuilder.commit();

      const groups = await groupRepository.findByCampaignId(campaign.id);

      expect(groups).to.deep.equal([{ name: 'L1' }, { name: 'L2' }]);
    });

    context('when there are schooling registrations for another campaign of the same organization', function () {
      it('returns the group from schooling registration associated to the given campaign', async function () {
        const group1 = 'LB1';
        const group2 = 'LB2';
        const firstCampaign = databaseBuilder.factory.buildCampaign();
        const secondCampaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration(
          { organizationId: firstCampaign.organizationId, group: group1 },
          { campaignId: firstCampaign.id }
        );
        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration(
          { organizationId: secondCampaign.organizationId, group: group2 },
          { campaignId: secondCampaign.id }
        );

        await databaseBuilder.commit();

        const groups = await groupRepository.findByCampaignId(firstCampaign.id);

        expect(groups).to.deep.equal([{ name: 'LB1' }]);
      });
    });

    context('when a participant has schooling registrations for another organization', function () {
      it('returns the group from schooling registration associated to organization of the given campaign', async function () {
        const group1 = 'AB1';
        const group2 = 'AB2';
        const user = { id: 100001 };
        const campaign = databaseBuilder.factory.buildCampaign();
        const otherCampaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration(
          { organizationId: campaign.organizationId, group: group1, user },
          { campaignId: campaign.id }
        );
        databaseBuilder.factory.buildSchoolingRegistration({
          organizationId: otherCampaign.organizationId,
          group: group2,
          user,
        });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: otherCampaign.id, userId: user.id });
        await databaseBuilder.commit();

        const groups = await groupRepository.findByCampaignId(campaign.id);

        expect(groups).to.deep.equal([{ name: 'AB1' }]);
      });
    });

    context('when several participants have the same group', function () {
      it('returns each group one time', async function () {
        const group = 'AB5';
        const campaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration(
          { organizationId: campaign.organizationId, group: group },
          { campaignId: campaign.id }
        );
        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration(
          { organizationId: campaign.organizationId, group: group },
          { campaignId: campaign.id }
        );
        await databaseBuilder.commit();

        const groups = await groupRepository.findByCampaignId(campaign.id);

        expect(groups).to.deep.equal([{ name: 'AB5' }]);
      });
    });
  });
});
