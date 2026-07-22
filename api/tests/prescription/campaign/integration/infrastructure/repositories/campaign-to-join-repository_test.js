import sinon from 'sinon';

import * as OidcIdentityProviders from '../../../../../../src/identity-access-management/domain/constants/oidc-identity-providers.js';
import { CampaignToJoin } from '../../../../../../src/prescription/campaign/domain/read-models/CampaignToJoin.js';
import * as campaignToJoinRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-to-join-repository.js';
import { CampaignExternalIdTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { CAMPAIGN_FEATURES } from '../../../../../../src/shared/constants.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

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

      const featureExternalId = databaseBuilder.factory.buildFeature(CAMPAIGN_FEATURES.EXTERNAL_ID).id;
      databaseBuilder.factory.buildCampaignFeature({
        campaignId: expectedCampaign.id,
        featureId: featureExternalId,
        params: { label: 'Id Ex', type: CampaignExternalIdTypes.STRING },
      });

      const featureRecommendationEngineId = databaseBuilder.factory.buildFeature(
        CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE,
      ).id;
      databaseBuilder.factory.buildCampaignFeature({
        campaignId: expectedCampaign.id,
        featureId: featureRecommendationEngineId,
        params: {},
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
      expect(actualCampaign.externalIdLabel).to.equal('Id Ex');
      expect(actualCampaign.customLandingPageText).to.equal(expectedCampaign.customLandingPageText);
      expect(actualCampaign.externalIdHelpImageUrl).to.equal(expectedCampaign.externalIdHelpImageUrl);
      expect(actualCampaign.alternativeTextToExternalIdHelpImage).to.equal(
        expectedCampaign.alternativeTextToExternalIdHelpImage,
      );
      expect(actualCampaign.recommendationEngine).to.be.true;
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

    it('should return true for recommendationEngine when campaign has RECOMMENDATION_ENGINE feature', async function () {
      // given
      const { code, id: campaignId } = databaseBuilder.factory.buildCampaign();
      const featureId = databaseBuilder.factory.buildFeature(CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE).id;
      databaseBuilder.factory.buildCampaignFeature({ campaignId, featureId });
      await databaseBuilder.commit();

      // when
      const actualCampaign = await campaignToJoinRepository.getByCode({ code, organizationFeatureAPI });

      // then
      expect(actualCampaign.recommendationEngine).to.be.true;
    });

    it('should return false for recommendationEngine when campaign has no RECOMMENDATION_ENGINE feature', async function () {
      // given
      const { code } = databaseBuilder.factory.buildCampaign();
      await databaseBuilder.commit();

      // when
      const actualCampaign = await campaignToJoinRepository.getByCode({ code, organizationFeatureAPI });

      // then
      expect(actualCampaign.recommendationEngine).to.be.false;
    });

    it('should return restricted access if organization has learner import feature', async function () {
      // given
      const { code, organizationId } = databaseBuilder.factory.buildCampaign();

      (organizationFeatureAPI.getAllFeaturesFromOrganization
        .withArgs(organizationId)
        .resolves({ hasLearnersImportFeature: true }),
        databaseBuilder.factory.buildCampaign());

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

    it('should be insensitive to case', async function () {
      const code = 'LAURA123';
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const organization = databaseBuilder.factory.buildOrganization({});
      const expectedCampaign = databaseBuilder.factory.buildCampaign({
        code,
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
      });
      databaseBuilder.factory.buildCampaign();
      await databaseBuilder.commit();

      // when
      const actualCampaign = await campaignToJoinRepository.getByCode({
        code: code.toLowerCase(),
        organizationFeatureAPI,
      });

      // then
      expect(actualCampaign).to.be.instanceOf(CampaignToJoin);
      expect(actualCampaign.id).to.equal(expectedCampaign.id);
    });
  });
});
