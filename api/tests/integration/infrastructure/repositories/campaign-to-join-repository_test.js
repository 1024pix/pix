const { expect, databaseBuilder, catchErr } = require('../../../test-helper');
const campaignToJoinRepository = require('../../../../lib/infrastructure/repositories/campaign-to-join-repository');
const CampaignToJoin = require('../../../../lib/domain/models/CampaignToJoin');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | CampaignToJoin', () => {

  describe('#get', () => {

    it('should return the CampaignToJoin', async () => {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const expectedCampaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      await databaseBuilder.commit();

      // when
      const actualCampaign = await campaignToJoinRepository.get(expectedCampaign.id);

      // then
      expect(actualCampaign).to.be.instanceOf(CampaignToJoin);
      expect(actualCampaign.id).to.equal(expectedCampaign.id);
      expect(actualCampaign.code).to.deep.equal(expectedCampaign.code);
      expect(actualCampaign.title).to.deep.equal(expectedCampaign.title);
      expect(actualCampaign.idPixLabel).to.deep.equal(expectedCampaign.idPixLabel);
      expect(actualCampaign.customLandingPageText).to.deep.equal(expectedCampaign.customLandingPageText);
      expect(actualCampaign.externalIdHelpImageUrl).to.deep.equal(expectedCampaign.externalIdHelpImageUrl);
      expect(actualCampaign.alternativeTextToExternalIdHelpImage).to.deep.equal(expectedCampaign.alternativeTextToExternalIdHelpImage);
      expect(actualCampaign.createdAt).to.deep.equal(expectedCampaign.createdAt);
      expect(actualCampaign.archivedAt).to.deep.equal(expectedCampaign.archivedAt);
      expect(actualCampaign.type).to.deep.equal(expectedCampaign.type);
      expect(actualCampaign.organizationId).to.deep.equal(organization.id);
      expect(actualCampaign.organizationName).to.deep.equal(organization.name);
      expect(actualCampaign.organizationType).to.deep.equal(organization.type);
      expect(actualCampaign.organizationLogoUrl).to.deep.equal(organization.logoUrl);
      expect(actualCampaign.isRestricted).to.deep.equal(organization.isManagingStudents);
    });

    it('should throw a NotFoundError when no campaign exists with given id', async () => {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const existingId = databaseBuilder.factory.buildCampaign({ organizationId: organization.id }).id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(campaignToJoinRepository.get)(existingId + 1000);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
