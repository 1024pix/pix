import * as campaignToJoinRepository from '../../../../../src/identity-access-management/infrastructure/repositories/campaign-to-join-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Repository | CampaignToJoin', function () {
  describe('isSimplifiedAccessCampaign', function () {
    describe('When campaign is linked to a target profile with simplified access', function () {
      it('should return true', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile({ isSimplifiedAccess: true });
        const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        await databaseBuilder.commit();

        // when
        const isSimplifiedAccess = await campaignToJoinRepository.isSimplifiedAccessCampaign(campaign.code);

        // then
        expect(isSimplifiedAccess).to.be.true;
      });
    });

    describe('When campaign is not linked to a target profile with simplified access', function () {
      it('should return false', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile({ isSimplifiedAccess: false });
        const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
        await databaseBuilder.commit();

        // when
        const isSimplifiedAccess = await campaignToJoinRepository.isSimplifiedAccessCampaign(campaign.code);

        // then
        expect(isSimplifiedAccess).to.be.false;
      });
    });

    describe('when campaign code does not exist', function () {
      it('should return false', async function () {
        // when
        const isSimplifiedAccess = await campaignToJoinRepository.isSimplifiedAccessCampaign('UNKNOWN_CODE');

        // then
        expect(isSimplifiedAccess).to.be.false;
      });
    });
  });
});
