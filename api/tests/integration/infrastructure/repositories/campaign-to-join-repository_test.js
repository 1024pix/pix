const { expect, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const campaignToJoinRepository = require('../../../../lib/infrastructure/repositories/campaign-to-join-repository');
const CampaignToJoin = require('../../../../lib/domain/read-models/CampaignToJoin');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | CampaignToJoin', function() {

  describe('#get', function() {

    it('should return the CampaignToJoin', async function() {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const organization = databaseBuilder.factory.buildOrganization();
      const expectedCampaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id, targetProfileId: targetProfile.id });
      databaseBuilder.factory.buildCampaign();
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
      expect(actualCampaign.archivedAt).to.deep.equal(expectedCampaign.archivedAt);
      expect(actualCampaign.type).to.deep.equal(expectedCampaign.type);
      expect(actualCampaign.organizationId).to.deep.equal(organization.id);
      expect(actualCampaign.organizationName).to.deep.equal(organization.name);
      expect(actualCampaign.organizationType).to.deep.equal(organization.type);
      expect(actualCampaign.organizationLogoUrl).to.deep.equal(organization.logoUrl);
      expect(actualCampaign.isRestricted).to.deep.equal(organization.isManagingStudents);
      expect(actualCampaign.targetProfileName).to.deep.equal(targetProfile.name);
      expect(actualCampaign.targetProfileImageUrl).to.deep.equal(targetProfile.imageUrl);
    });

    it('should throw a NotFoundError when no campaign exists with given id', async function() {
      // given
      const existingId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(campaignToJoinRepository.get)(existingId + 1000);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#getByCode', function() {

    it('should return the CampaignToJoin by its code', async function() {
      // given
      const code = 'LAURA123';
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const organization = databaseBuilder.factory.buildOrganization();
      const expectedCampaign = databaseBuilder.factory.buildCampaign({ code, organizationId: organization.id, targetProfileId: targetProfile.id });
      databaseBuilder.factory.buildCampaign();
      await databaseBuilder.commit();

      // when
      const actualCampaign = await campaignToJoinRepository.getByCode(code);

      // then
      expect(actualCampaign).to.be.instanceOf(CampaignToJoin);
      expect(actualCampaign.id).to.equal(expectedCampaign.id);
      expect(actualCampaign.code).to.deep.equal(expectedCampaign.code);
      expect(actualCampaign.title).to.deep.equal(expectedCampaign.title);
      expect(actualCampaign.idPixLabel).to.deep.equal(expectedCampaign.idPixLabel);
      expect(actualCampaign.customLandingPageText).to.deep.equal(expectedCampaign.customLandingPageText);
      expect(actualCampaign.externalIdHelpImageUrl).to.deep.equal(expectedCampaign.externalIdHelpImageUrl);
      expect(actualCampaign.alternativeTextToExternalIdHelpImage).to.deep.equal(expectedCampaign.alternativeTextToExternalIdHelpImage);
      expect(actualCampaign.archivedAt).to.deep.equal(expectedCampaign.archivedAt);
      expect(actualCampaign.type).to.deep.equal(expectedCampaign.type);
      expect(actualCampaign.organizationId).to.deep.equal(organization.id);
      expect(actualCampaign.organizationName).to.deep.equal(organization.name);
      expect(actualCampaign.organizationType).to.deep.equal(organization.type);
      expect(actualCampaign.organizationLogoUrl).to.deep.equal(organization.logoUrl);
      expect(actualCampaign.isRestricted).to.deep.equal(organization.isManagingStudents);
      expect(actualCampaign.targetProfileName).to.deep.equal(targetProfile.name);
      expect(actualCampaign.targetProfileImageUrl).to.deep.equal(targetProfile.imageUrl);
      expect(actualCampaign.isSimplifiedAccess).to.deep.equal(targetProfile.isSimplifiedAccess);
    });

    context('when the organization of the campaign has the POLE EMPLOI tag', function() {
      it('should return true for organizationIsPoleEmploi', async function() {
        // given
        const code = 'LAURA456';
        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildCampaign({ code, organizationId: organization.id });
        databaseBuilder.factory.buildOrganizationTag({
          organizationId: organization.id,
          tagId: databaseBuilder.factory.buildTag({ name: 'POLE EMPLOI' }).id,
        });
        await databaseBuilder.commit();

        // when
        const actualCampaign = await campaignToJoinRepository.getByCode(code);

        // then
        expect(actualCampaign).to.be.instanceOf(CampaignToJoin);
        expect(actualCampaign.organizationIsPoleEmploi).to.be.true;
      });
    });

    context('when the organization of the campaign does not have the POLE EMPLOI tag', function() {
      it('should return false for organizationIsPoleEmploi', async function() {
        // given
        const code = 'LAURA456';
        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildCampaign({ code, organizationId: organization.id });
        await databaseBuilder.commit();

        // when
        const actualCampaign = await campaignToJoinRepository.getByCode(code);

        // then
        expect(actualCampaign).to.be.instanceOf(CampaignToJoin);
        expect(actualCampaign.organizationIsPoleEmploi).to.be.false;
      });
    });

    it('should throw a NotFoundError when no campaign exists with given code', async function() {
      // given
      const code = 'LAURA123';
      databaseBuilder.factory.buildCampaign({ code });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(campaignToJoinRepository.getByCode)('LAURA456');

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#isCampaignJoinableByUser', function() {

    it('should return false if the campaign is archived', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignData = databaseBuilder.factory.buildCampaign({ archivedAt: new Date('2020-01-01') });
      const campaignToJoin = domainBuilder.buildCampaignToJoin(campaignData);
      await databaseBuilder.commit();

      // when
      const canJoinCampaign = await campaignToJoinRepository.isCampaignJoinableByUser(campaignToJoin, userId);

      // then
      expect(canJoinCampaign).to.be.false;
    });

    it('should return false if the campaign is restricted and the user does not have a corresponding schooling registration', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true }).id;
      databaseBuilder.factory.buildSchoolingRegistration({ organizationId });
      const campaignData = databaseBuilder.factory.buildCampaign({ organizationId });
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        ...campaignData,
        organizationIsManagingStudents: true,
      });
      await databaseBuilder.commit();

      // when
      const canJoinCampaign = await campaignToJoinRepository.isCampaignJoinableByUser(campaignToJoin, userId);

      // then
      expect(canJoinCampaign).to.be.false;
    });

    it('should return true when the campaign is restricted and the user has a corresponding schooling registration', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true }).id;
      databaseBuilder.factory.buildSchoolingRegistration({ userId, organizationId });
      const campaignData = databaseBuilder.factory.buildCampaign({ organizationId });
      const campaignToJoin = domainBuilder.buildCampaignToJoin({
        ...campaignData,
        organizationIsManagingStudents: true,
      });
      await databaseBuilder.commit();

      // when
      const canJoinCampaign = await campaignToJoinRepository.isCampaignJoinableByUser(campaignToJoin, userId);

      // then
      expect(canJoinCampaign).to.be.true;
    });
  });
});
