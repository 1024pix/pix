import { expect, databaseBuilder } from '../../../test-helper.js';
import * as prescriberRoleRepository from '../../../../lib/infrastructure/repositories/prescriber-role-repository.js';

describe('Integration | Repository | prescriber-role-repository', function () {
  describe('#getForCampaign', function () {
    describe("when user is an admin of the campaign's organization", function () {
      it('should return ADMIN role', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const userId = databaseBuilder.factory.buildUser().id;
        const campaign = databaseBuilder.factory.buildCampaign({ organizationId });
        databaseBuilder.factory.buildMembership({ organizationId, userId, organizationRole: 'ADMIN' });
        await databaseBuilder.commit();

        // when
        const result = await prescriberRoleRepository.getForCampaign({ userId, campaignId: campaign.id });

        // then
        expect(result).to.deep.equal('ADMIN');
      });
    });

    describe("when user is a MEMBER of the campaign's organization", function () {
      describe('when user does not own the campaign', function () {
        it('should return MEMBER role', async function () {
          // given
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          const userId = databaseBuilder.factory.buildUser().id;
          const campaign = databaseBuilder.factory.buildCampaign({ organizationId });
          databaseBuilder.factory.buildMembership({ organizationId, userId, organizationRole: 'MEMBER' });
          await databaseBuilder.commit();

          // when
          const result = await prescriberRoleRepository.getForCampaign({ userId, campaignId: campaign.id });

          // then
          expect(result).to.deep.equal('MEMBER');
        });
      });

      describe('when user own the campaign', function () {
        it('should return OWNER role', async function () {
          // given
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          const userId = databaseBuilder.factory.buildUser().id;
          const campaign = databaseBuilder.factory.buildCampaign({ organizationId, ownerId: userId });
          databaseBuilder.factory.buildMembership({ organizationId, userId, organizationRole: 'MEMBER' });
          await databaseBuilder.commit();

          // when
          const result = await prescriberRoleRepository.getForCampaign({ userId, campaignId: campaign.id });

          // then
          expect(result).to.deep.equal('OWNER');
        });
      });
    });

    it('should return null if campaign does not exists', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      const unknownCampaignId = campaignId + 1;
      await databaseBuilder.commit();

      // when
      const result = await prescriberRoleRepository.getForCampaign({ userId, campaignId: unknownCampaignId });

      // then
      expect(result).to.be.null;
    });

    describe('when user is not a member of the organization', function () {
      it('should return null if user member from another organization', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const otherUserId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        databaseBuilder.factory.buildMembership({ userId: otherUserId, organizationId, disabledAt: null });
        await databaseBuilder.commit();

        // when
        const result = await prescriberRoleRepository.getForCampaign({ userId, campaignId });

        // then
        expect(result).to.be.null;
      });

      it("should throw a not found error if user's membership has been disable", async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
        databaseBuilder.factory.buildMembership({ userId, organizationId, disabledAt: new Date() });
        await databaseBuilder.commit();

        // when
        const result = await prescriberRoleRepository.getForCampaign({ userId, campaignId });

        // then
        expect(result).to.be.null;
      });
    });
  });
});
