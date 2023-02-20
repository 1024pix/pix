import { expect, databaseBuilder } from '../../../test-helper';
import groupRepository from '../../../../lib/infrastructure/repositories/group-repository';

describe('Integration | Repository | Group', function () {
  describe('#findByCampaignId', function () {
    it('returns the group from organization learner associated to the given campaign', async function () {
      const group1 = 'L1';
      const group2 = 'L2';
      const campaign = databaseBuilder.factory.buildCampaign();

      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { organizationId: campaign.organizationId, group: group1 },
        { campaignId: campaign.id }
      );
      databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
        { organizationId: campaign.organizationId, group: group2 },
        { campaignId: campaign.id }
      );
      await databaseBuilder.commit();

      const groups = await groupRepository.findByCampaignId(campaign.id);

      expect(groups).to.deep.equal([{ name: 'L1' }, { name: 'L2' }]);
    });

    context('when several participants have the same group', function () {
      it('returns each group one time', async function () {
        const group = 'AB5';
        const campaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, group: group },
          { campaignId: campaign.id }
        );
        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, group: group },
          { campaignId: campaign.id }
        );
        await databaseBuilder.commit();

        const groups = await groupRepository.findByCampaignId(campaign.id);

        expect(groups).to.deep.equal([{ name: 'AB5' }]);
      });
    });

    context('when participants has no group', function () {
      it('returns empty array', async function () {
        const group = null;
        const campaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, group: group },
          { campaignId: campaign.id }
        );
        await databaseBuilder.commit();

        const groups = await groupRepository.findByCampaignId(campaign.id);

        expect(groups).to.deep.equal([]);
      });
    });

    context('when participation is deleted', function () {
      it('should not return group', async function () {
        const group = 'AB5';
        const campaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithOrganizationLearner(
          { organizationId: campaign.organizationId, group: group },
          { campaignId: campaign.id, deletedAt: new Date() }
        );

        await databaseBuilder.commit();

        const groups = await groupRepository.findByCampaignId(campaign.id);

        expect(groups).to.deep.equal([]);
      });
    });
  });

  describe('#findByOrganizationId', function () {
    it('should return list of groups from an organization ordered by name', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        group: '5A',
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        group: '_3A',
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        group: '3A',
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        group: 'T2',
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        group: 't1',
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        group: 't1',
      });

      await databaseBuilder.commit();

      // when
      const groups = await groupRepository.findByOrganizationId({
        organizationId: organization.id,
      });

      // then
      expect(groups).to.have.lengthOf(5);
      expect(groups).to.deep.equal([{ name: '3A' }, { name: '5A' }, { name: 'T2' }, { name: '_3A' }, { name: 't1' }]);
    });

    it('should return list of groups from the given organization', async function () {
      const organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        group: '5A',
      });
      databaseBuilder.factory.buildOrganizationLearner({
        group: '5B',
      });

      await databaseBuilder.commit();

      const groups = await groupRepository.findByOrganizationId({
        organizationId: organization.id,
      });

      expect(groups).to.deep.equal([{ name: '5A' }]);
    });

    it('should omit groups for organization learner disabled', async function () {
      const organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        group: '5A',
        isDisabled: false,
      });
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        group: '5B',
        isDisabled: true,
      });

      await databaseBuilder.commit();

      const groups = await groupRepository.findByOrganizationId({
        organizationId: organization.id,
      });

      expect(groups).to.deep.equal([{ name: '5A' }]);
    });

    it('returns nothing if the organization learner has no group', async function () {
      const organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        group: null,
        isDisabled: false,
      });

      await databaseBuilder.commit();

      const groups = await groupRepository.findByOrganizationId({
        organizationId: organization.id,
      });

      expect(groups).to.be.empty;
    });
  });
});
