import * as campaignCreatorRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-creator-repository.js';
import { ORGANIZATION_FEATURE } from '../../../../../../src/shared/domain/constants.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Repository | CampaignCreatorRepository', function () {
  describe('#get', function () {
    it('returns the creator for the given organization', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      const { id: otherOrganizationId } = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      databaseBuilder.factory.buildMembership({ organizationId: otherOrganizationId, userId });
      const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileShare({
        organizationId,
        targetProfileId,
      });
      await databaseBuilder.commit();

      const creator = await campaignCreatorRepository.get(organizationId);

      expect(creator.availableTargetProfileIds).to.deep.equal([targetProfileId]);
    });

    context('multiple assessment feature', function () {
      it('returns true when feature is available', async function () {
        const featureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT).id;
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildMembership({ organizationId, userId });
        databaseBuilder.factory.buildOrganizationFeature({ organizationId, featureId });
        await databaseBuilder.commit();

        const creator = await campaignCreatorRepository.get(organizationId);

        expect(creator.isMultipleSendingsAssessmentEnable).to.be.true;
      });
    });

    context('when there are target profiles', function () {
      it('returns the shared target profiles', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildMembership({ organizationId, userId });

        const { id: targetProfileSharedId } = databaseBuilder.factory.buildTargetProfile({
          outdated: false,
        });
        const { id: targetProfileSharedId2 } = databaseBuilder.factory.buildTargetProfile({
          outdated: false,
        });
        databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfileSharedId, organizationId });
        databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfileSharedId2, organizationId });
        databaseBuilder.factory.buildTargetProfile({
          outdated: false,
        });

        await databaseBuilder.commit();

        const creator = await campaignCreatorRepository.get(organizationId);
        expect(creator.availableTargetProfileIds).to.exactlyContain([targetProfileSharedId, targetProfileSharedId2]);
      });

      it('returns the target profiles is owned by the organization', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildMembership({ organizationId, userId });

        const { id: organizationTargetProfileId } = databaseBuilder.factory.buildTargetProfile({
          outdated: false,
        });
        databaseBuilder.factory.buildTargetProfileShare({
          organizationId,
          targetProfileId: organizationTargetProfileId,
        });

        await databaseBuilder.commit();

        const creator = await campaignCreatorRepository.get(organizationId);
        expect(creator.availableTargetProfileIds).to.exactlyContain([organizationTargetProfileId]);
      });

      context('when target profiles are outdated', function () {
        it('does not return target profiles', async function () {
          const { id: userId } = databaseBuilder.factory.buildUser();
          const { id: organizationId } = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildMembership({ organizationId, userId });

          const targetProfileId = databaseBuilder.factory.buildTargetProfile({
            outdated: true,
          }).id;
          databaseBuilder.factory.buildTargetProfileShare({
            organizationId,
            targetProfileId,
          });
          const { id: targetProfileSharedId } = databaseBuilder.factory.buildTargetProfile({
            outdated: true,
          });
          databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfileSharedId, organizationId });

          await databaseBuilder.commit();

          const creator = await campaignCreatorRepository.get(organizationId);
          expect(creator.availableTargetProfileIds).to.be.empty;
        });
      });
    });
  });
});
