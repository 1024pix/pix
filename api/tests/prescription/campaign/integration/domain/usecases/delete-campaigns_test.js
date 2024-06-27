import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import * as campaignAdministrationRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-administration-repository.js';
import * as campaignParticipationRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { databaseBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Integration | UseCases | delete-campaign', function () {
  describe('success case', function () {
    let clock;
    let now;

    beforeEach(function () {
      now = new Date('1992-07-07');
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('should not throw', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId, organizationId, organizationRole: 'MEMBER' });
      const campaignId = databaseBuilder.factory.buildCampaign({ ownerId: userId, organizationId }).id;
      databaseBuilder.factory.buildCampaignParticipation({ campaignId });

      await databaseBuilder.commit();
      let error;
      try {
        await usecases.deleteCampaigns({ userId, organizationId, campaignIds: [campaignId] });
      } catch (e) {
        error = e;
      }

      // when & then
      expect(error).to.be.undefined;
    });

    it('should delete campaign for given id and participation associated', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId, organizationId, organizationRole: 'MEMBER' });
      const campaignId = databaseBuilder.factory.buildCampaign({ ownerId: userId, organizationId }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;

      await databaseBuilder.commit();

      await usecases.deleteCampaigns({ userId, organizationId, campaignIds: [campaignId] });
      const updatedCampaign = await campaignAdministrationRepository.get(campaignId);
      const updatedCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

      // when & then
      expect(updatedCampaign.deletedAt).to.deep.equal(now);
      expect(updatedCampaign.deletedBy).to.equal(userId);
      expect(updatedCampaignParticipation.deletedAt).to.deep.equal(now);
      expect(updatedCampaignParticipation.deletedBy).to.equal(userId);
    });
  });
});
