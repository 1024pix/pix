const { expect, databaseBuilder } = require('../../../test-helper');
const divisionRepository = require('../../../../lib/infrastructure/repositories/division-repository');

describe('Integration | Repository | Division', () => {
  describe('#findByCampaignId', () => {
    it('returns the division from schooling registration associated to the given campaign', async () => {
      const division1 = '6emeB';
      const division2 = '3emeA';
      const campaign = databaseBuilder.factory.buildCampaign();

      databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division1 }, { campaignId: campaign.id });
      databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division2 }, { campaignId: campaign.id });
      await databaseBuilder.commit();

      const divisions = await divisionRepository.findByCampaignId(campaign.id);

      expect(divisions).to.deep.equal([{ name: '3emeA' }, { name: '6emeB' }]);
    });

    context('when there are schooling registrations for another campaign of the same organization', () => {
      it('returns the division from schooling registration associated to the given campaign', async () => {
        const division1 = '6emeB';
        const division2 = '3emeA';
        const campaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division1 }, { campaignId: campaign.id });
        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division2 });
        await databaseBuilder.commit();

        const divisions = await divisionRepository.findByCampaignId(campaign.id);

        expect(divisions).to.deep.equal([{ name: '6emeB' }]);
      });
    });

    context('when a participant has schooling registrations for another organization', () => {
      it('returns the division from schooling registration associated to organization of the given campaign', async () => {
        const division1 = '4emeG';
        const division2 = '3emeC';
        const user = { id: 100001 };
        const campaign = databaseBuilder.factory.buildCampaign();
        const otherCampaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division1, user }, { campaignId: campaign.id });
        databaseBuilder.factory.buildSchoolingRegistration({ organizationId: otherCampaign.organizationId, division: division2, userId: user.id });
        databaseBuilder.factory.buildCampaignParticipation({ campaignId: otherCampaign.id, userId: user.id });
        await databaseBuilder.commit();

        const divisions = await divisionRepository.findByCampaignId(campaign.id);

        expect(divisions).to.deep.equal([{ name: '4emeG' }]);
      });
    });

    context('when several participants have the same division', () => {
      it('returns each division one time', async () => {
        const division = '5eme1';
        const campaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division }, { campaignId: campaign.id });
        databaseBuilder.factory.buildCampaignParticipationWithSchoolingRegistration({ organizationId: campaign.organizationId, division: division }, { campaignId: campaign.id });
        await databaseBuilder.commit();

        const divisions = await divisionRepository.findByCampaignId(campaign.id);

        expect(divisions).to.deep.equal([{ name: '5eme1' }]);
      });
    });
  });

  describe('#findByOrganizationId', () => {
    it('should return list of divisions from an organization ordered by name', async () => {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: '5A',
      });
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: '_3A',
      });
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: '3A',
      });
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: 'T2',
      });
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: 't1',
      });
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: 't1',
      });

      await databaseBuilder.commit();

      // when
      const divisions = await divisionRepository.findByOrganizationId({ organizationId: organization.id });

      // then
      expect(divisions).to.have.lengthOf(5);
      expect(divisions).to.deep.equal([
        { name: '3A' },
        { name: '5A' },
        { name: 'T2' },
        { name: '_3A' },
        { name: 't1' },
      ]);
    });

    it('should omit old divisions', async () => {
      // given
      const organization = databaseBuilder.factory.buildOrganization();

      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: '5A',
        updatedAt: new Date('2021-01-01'),
      });
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: '5A',
        updatedAt: new Date('2019-01-01'),
      });
      databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: organization.id,
        division: 'very-old-division',
        updatedAt: new Date('2019-01-01'),
      });

      await databaseBuilder.commit();

      // when
      const divisions = await divisionRepository.findByOrganizationId({ organizationId: organization.id });

      // then
      expect(divisions).to.deep.equal([{ name: '5A' }]);
    });
  });
});
