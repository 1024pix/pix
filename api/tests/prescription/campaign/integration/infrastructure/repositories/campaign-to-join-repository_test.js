import { NotFoundError } from '../../../../../../lib/domain/errors.js';
import * as OidcIdentityProviders from '../../../../../../src/identity-access-management/domain/constants/oidc-identity-providers.js';
import { CampaignToJoin } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignToJoin.js';
import * as campaignToJoinRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-to-join-repository.js';
import { catchErr, databaseBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Integration | Repository | CampaignToJoin', function () {
  let organizationFeatureAPI;

  beforeEach(function () {
    organizationFeatureAPI = {
      getAllFeaturesFromOrganization: sinon.stub().resolves({ hasLearnersImportFeature: false }),
    };
  });

  describe('#getByCode', function () {
    it('should return the CampaignToJoin by its code', async function () {
      // given
      const code = 'LAURA123';
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const organization = databaseBuilder.factory.buildOrganization({
        identityProviderForCampaigns: OidcIdentityProviders.POLE_EMPLOI.code,
      });
      const expectedCampaign = databaseBuilder.factory.buildCampaign({
        code,
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
      });
      databaseBuilder.factory.buildCampaign();
      await databaseBuilder.commit();

      // when
      const actualCampaign = await campaignToJoinRepository.getByCode({ code, organizationFeatureAPI });

      // then
      expect(actualCampaign).to.be.instanceOf(CampaignToJoin);
      expect(actualCampaign.id).to.equal(expectedCampaign.id);
      expect(actualCampaign.code).to.equal(expectedCampaign.code);
      expect(actualCampaign.title).to.equal(expectedCampaign.title);
      expect(actualCampaign.idPixLabel).to.equal(expectedCampaign.idPixLabel);
      expect(actualCampaign.customLandingPageText).to.equal(expectedCampaign.customLandingPageText);
      expect(actualCampaign.externalIdHelpImageUrl).to.equal(expectedCampaign.externalIdHelpImageUrl);
      expect(actualCampaign.alternativeTextToExternalIdHelpImage).to.equal(
        expectedCampaign.alternativeTextToExternalIdHelpImage,
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
      expect(actualCampaign.identityProvider).to.equal(OidcIdentityProviders.POLE_EMPLOI.code);
    });

    it('should return restricted access if organization has learner import feature', async function () {
      // given
      const { code, organizationId } = databaseBuilder.factory.buildCampaign();

      organizationFeatureAPI.getAllFeaturesFromOrganization
        .withArgs(organizationId)
        .resolves({ hasLearnersImportFeature: true }),
        databaseBuilder.factory.buildCampaign();

      await databaseBuilder.commit();

      // when
      const actualCampaign = await campaignToJoinRepository.getByCode({ code, organizationFeatureAPI });

      // then
      expect(actualCampaign.isRestricted).to.be.true;
    });

    it('should throw a NotFoundError when no campaign exists with given code', async function () {
      // given
      const code = 'LAURA123';
      databaseBuilder.factory.buildCampaign({ code });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(campaignToJoinRepository.getByCode)({ code: 'LAURA456', organizationFeatureAPI });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
