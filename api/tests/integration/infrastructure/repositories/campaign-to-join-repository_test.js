import { expect, databaseBuilder, catchErr } from '../../../test-helper';
import campaignToJoinRepository from '../../../../lib/infrastructure/repositories/campaign-to-join-repository';
import CampaignToJoin from '../../../../lib/domain/read-models/CampaignToJoin';
import { NotFoundError } from '../../../../lib/domain/errors';
import DomainTransaction from '../../../../lib/infrastructure/DomainTransaction';
import OidcIdentityProviders from '../../../../lib/domain/constants/oidc-identity-providers';

describe('Integration | Repository | CampaignToJoin', function () {
  describe('#get', function () {
    it('should return the CampaignToJoin', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const organization = databaseBuilder.factory.buildOrganization();
      const expectedCampaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
      });
      databaseBuilder.factory.buildCampaign();
      await databaseBuilder.commit();

      // when
      const actualCampaign = await DomainTransaction.execute(async (domainTransaction) => {
        return campaignToJoinRepository.get(expectedCampaign.id, domainTransaction);
      });

      // then
      expect(actualCampaign).to.be.instanceOf(CampaignToJoin);
      expect(actualCampaign.id).to.equal(expectedCampaign.id);
      expect(actualCampaign.code).to.equal(expectedCampaign.code);
      expect(actualCampaign.title).to.equal(expectedCampaign.title);
      expect(actualCampaign.idPixLabel).to.equal(expectedCampaign.idPixLabel);
      expect(actualCampaign.customLandingPageText).to.equal(expectedCampaign.customLandingPageText);
      expect(actualCampaign.externalIdHelpImageUrl).to.equal(expectedCampaign.externalIdHelpImageUrl);
      expect(actualCampaign.alternativeTextToExternalIdHelpImage).to.equal(
        expectedCampaign.alternativeTextToExternalIdHelpImage
      );
      expect(actualCampaign.archivedAt).to.equal(expectedCampaign.archivedAt);
      expect(actualCampaign.type).to.equal(expectedCampaign.type);
      expect(actualCampaign.organizationId).to.equal(organization.id);
      expect(actualCampaign.organizationName).to.equal(organization.name);
      expect(actualCampaign.organizationType).to.equal(organization.type);
      expect(actualCampaign.organizationLogoUrl).to.equal(organization.logoUrl);
      expect(actualCampaign.organizationShowNPS).to.equal(organization.showNPS);
      expect(actualCampaign.organizationFormNPSUrl).to.equal(organization.formNPSUrl);
      expect(actualCampaign.isRestricted).to.equal(organization.isManagingStudents);
      expect(actualCampaign.targetProfileName).to.equal(targetProfile.name);
      expect(actualCampaign.targetProfileImageUrl).to.equal(targetProfile.imageUrl);
    });

    it('should throw a NotFoundError when no campaign exists with given id', async function () {
      // given
      let error;
      const existingId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();

      // when

      await DomainTransaction.execute(async (domainTransaction) => {
        error = await catchErr(campaignToJoinRepository.get)(existingId + 1000, domainTransaction);
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#getByCode', function () {
    it('should return the CampaignToJoin by its code', async function () {
      // given
      const code = 'LAURA123';
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const organization = databaseBuilder.factory.buildOrganization({
        identityProviderForCampaigns: OidcIdentityProviders.POLE_EMPLOI.service.code,
      });
      const expectedCampaign = databaseBuilder.factory.buildCampaign({
        code,
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
      });
      databaseBuilder.factory.buildCampaign();
      await databaseBuilder.commit();

      // when
      const actualCampaign = await campaignToJoinRepository.getByCode(code);

      // then
      expect(actualCampaign).to.be.instanceOf(CampaignToJoin);
      expect(actualCampaign.id).to.equal(expectedCampaign.id);
      expect(actualCampaign.code).to.equal(expectedCampaign.code);
      expect(actualCampaign.title).to.equal(expectedCampaign.title);
      expect(actualCampaign.idPixLabel).to.equal(expectedCampaign.idPixLabel);
      expect(actualCampaign.customLandingPageText).to.equal(expectedCampaign.customLandingPageText);
      expect(actualCampaign.externalIdHelpImageUrl).to.equal(expectedCampaign.externalIdHelpImageUrl);
      expect(actualCampaign.alternativeTextToExternalIdHelpImage).to.equal(
        expectedCampaign.alternativeTextToExternalIdHelpImage
      );
      expect(actualCampaign.archivedAt).to.equal(expectedCampaign.archivedAt);
      expect(actualCampaign.type).to.equal(expectedCampaign.type);
      expect(actualCampaign.organizationId).to.equal(organization.id);
      expect(actualCampaign.organizationName).to.equal(organization.name);
      expect(actualCampaign.organizationType).to.equal(organization.type);
      expect(actualCampaign.organizationLogoUrl).to.equal(organization.logoUrl);
      expect(actualCampaign.organizationShowNPS).to.equal(organization.showNPS);
      expect(actualCampaign.organizationFormNPSUrl).to.equal(organization.formNPSUrl);
      expect(actualCampaign.isRestricted).to.equal(organization.isManagingStudents);
      expect(actualCampaign.targetProfileName).to.equal(targetProfile.name);
      expect(actualCampaign.targetProfileImageUrl).to.equal(targetProfile.imageUrl);
      expect(actualCampaign.isSimplifiedAccess).to.equal(targetProfile.isSimplifiedAccess);
      expect(actualCampaign.identityProvider).to.equal(OidcIdentityProviders.POLE_EMPLOI.service.code);
    });

    it('should throw a NotFoundError when no campaign exists with given code', async function () {
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
});
