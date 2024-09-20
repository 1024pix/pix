import { PROFILE_REWARDS_TABLE_NAME } from '../../../../../db/migrations/20240820101213_add-profile-rewards-table.js';
import { ProfileReward } from '../../../../../src/profile/domain/models/ProfileReward.js';
import { getByUserId, save } from '../../../../../src/profile/infrastructure/repositories/profile-reward-repository.js';
import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Profile | Integration | Repository | profile-reward', function () {
  describe('#save', function () {
    it('should give a reward to the user', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { rewardId } = databaseBuilder.factory.buildQuest({
        rewardType: REWARD_TYPES.ATTESTATION,
        eligibilityRequirements: {},
        successRequirements: {},
      });
      await databaseBuilder.commit();

      // when
      await save({ userId: userId, rewardId });

      // then
      const result = await knex(PROFILE_REWARDS_TABLE_NAME).where({ userId: userId });

      expect(result.length).to.equal(1);
      expect(result[0].userId).to.equal(userId);
      expect(result[0].rewardId).to.equal(rewardId);
      expect(result[0].rewardType).to.equal(REWARD_TYPES.ATTESTATION);
    });
  });

  describe('#getByUserId', function () {
    it('should return all profile rewards for the user', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: secondUserId } = databaseBuilder.factory.buildUser();

      const { rewardId: firstRewardId } = databaseBuilder.factory.buildQuest({
        rewardType: REWARD_TYPES.ATTESTATION,
        eligibilityRequirements: {},
        successRequirements: {},
      });
      const { rewardId: secondRewardId } = databaseBuilder.factory.buildQuest({
        rewardType: REWARD_TYPES.ATTESTATION,
        eligibilityRequirements: {},
        successRequirements: {},
      });
      databaseBuilder.factory.buildProfileReward({
        rewardId: firstRewardId,
        userId,
      });
      databaseBuilder.factory.buildProfileReward({
        rewardId: secondRewardId,
        userId,
      });
      databaseBuilder.factory.buildProfileReward({
        rewardId: secondRewardId,
        userId: secondUserId,
      });
      await databaseBuilder.commit();

      // when
      const result = await getByUserId({ userId });

      // then
      expect(result.length).to.equal(2);
      expect(result[0].rewardId).to.equal(firstRewardId);
      expect(result[0]).to.be.an.instanceof(ProfileReward);
      expect(result[1].rewardId).to.equal(secondRewardId);
      expect(result[1]).to.be.an.instanceof(ProfileReward);
    });

    it('should return empty array if there are no rewards', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();

      await databaseBuilder.commit();

      // when
      const result = await getByUserId({ userId });

      // then
      expect(result).to.be.empty;
    });
  });
});
