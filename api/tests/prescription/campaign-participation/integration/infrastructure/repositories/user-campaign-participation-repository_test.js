import { expect } from 'chai';

import { UserCampaignParticipation } from '../../../../../../src/prescription/campaign-participation/domain/read-models/UserCampaignParticipation.js';
import * as userCampaignParticipationRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/user-campaign-participation-repository.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Repository | UserCampaignParticipation', function () {
  describe('#findByUserId', function () {
    it('should return participations with id, campaignId and targetProfileId', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ targetProfileId });
      const { id: participationId } = databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId });
      await databaseBuilder.commit();

      // when
      const results = await userCampaignParticipationRepository.findByUserId({ userId });

      // then
      expect(results).to.have.lengthOf(1);
      expect(results[0]).to.be.instanceOf(UserCampaignParticipation);
      expect(results[0]).to.deep.equal({ id: participationId, campaignId, targetProfileId });
    });

    it('should return multiple participations', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId });
      databaseBuilder.factory.buildCampaignParticipation({ userId });
      await databaseBuilder.commit();

      // when
      const results = await userCampaignParticipationRepository.findByUserId({ userId });

      // then
      expect(results).to.have.lengthOf(2);
      expect(results[0]).to.be.instanceOf(UserCampaignParticipation);
      expect(results[1]).to.be.instanceOf(UserCampaignParticipation);
    });

    it('should not return deleted participations', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId, deletedAt: new Date() });
      await databaseBuilder.commit();

      // when
      const results = await userCampaignParticipationRepository.findByUserId({ userId });

      // then
      expect(results).to.have.lengthOf(0);
    });

    it('should return empty array when user has no participations', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const results = await userCampaignParticipationRepository.findByUserId({ userId });

      // then
      expect(results).to.have.lengthOf(0);
    });

    it('should not return participations of another user', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const otherUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCampaignParticipation({ userId: otherUserId });
      await databaseBuilder.commit();

      // when
      const results = await userCampaignParticipationRepository.findByUserId({ userId });

      // then
      expect(results).to.have.lengthOf(0);
    });
  });
});
